---
sidebar_position: 2
sidebar_label: "Exp 1: Custom LLM Integration"
---

# Experiment 1: Tích hợp Custom LLM vào distilabel

distilabel hỗ trợ hơn 15 LLM provider (OpenAI, Anthropic, Mistral, Groq, vLLM, Ollama...) thông qua các lớp kế thừa từ `LLM` base class. Khi cần tích hợp một provider chưa có sẵn (API nội bộ của công ty, provider mới, hoặc model local đặc thù), bạn cần viết custom `LLM` class.

---

## 1. Hợp đồng interface của LLM Base Class

Từ `distilabel/models/llms/base.py`, lớp `LLM` abstract yêu cầu:

```python
from abc import ABC, abstractmethod
from pydantic import BaseModel
from distilabel.utils.serialization import _Serializable

class LLM(BaseModel, _Serializable, ABC):
    generation_kwargs: dict = {}

    @property
    @abstractmethod
    def model_name(self) -> str:
        """Trả về tên model, dùng để logging và metadata."""
        ...

    @abstractmethod
    def generate(
        self,
        inputs: List["FormattedInput"],
        num_generations: int = 1,
        **kwargs,
    ) -> List["GenerateOutput"]:
        """Nhận batch inputs, trả về batch outputs.
        Mỗi input có thể tạo ra num_generations outputs."""
        ...

    def load(self) -> None:
        """Override để khởi tạo client, load model weights."""
        super().load()  # init _logger

    def unload(self) -> None:
        """Override để giải phóng tài nguyên."""
        pass
```

`FormattedInput = List[Dict[str, str]]` tức là list of messages (ChatType). `GenerateOutput = List[Optional[str]]` tức là list `num_generations` strings cho mỗi input.

---

## 2. Ví dụ: Tích hợp Ollama Local Server

Ollama cho phép chạy LLM locally qua REST API. Đây là ví dụ hiện thực custom `OllamaLLM`:

```python
import requests
from typing import Any, Dict, List, Optional, Union
from pydantic import Field
from distilabel.models.llms.base import LLM
from distilabel.typing import FormattedInput, GenerateOutput

class CustomOllamaLLM(LLM):
    """Custom LLM class để giao tiếp với Ollama server."""

    model_id: str = Field(description="Tên model trong Ollama (ví dụ: llama3, mistral)")
    base_url: str = Field(
        default="http://localhost:11434",
        description="URL của Ollama server",
    )
    timeout: int = Field(default=120, description="Timeout tính bằng giây")

    _client: Optional[requests.Session] = None

    @property
    def model_name(self) -> str:
        return self.model_id

    def load(self) -> None:
        super().load()  # khởi tạo self._logger
        self._client = requests.Session()
        self._client.headers.update({"Content-Type": "application/json"})
        # Test connection
        try:
            resp = self._client.get(f"{self.base_url}/api/tags", timeout=5)
            resp.raise_for_status()
            self._logger.info(f"Kết nối Ollama thành công tại {self.base_url}")
        except requests.RequestException as e:
            raise RuntimeError(f"Không thể kết nối đến Ollama: {e}") from e

    def unload(self) -> None:
        if self._client:
            self._client.close()
            self._client = None

    def generate(
        self,
        inputs: List[FormattedInput],
        num_generations: int = 1,
        **kwargs,
    ) -> List[GenerateOutput]:
        outputs = []

        for messages in inputs:
            generations_for_input = []
            for _ in range(num_generations):
                try:
                    payload = {
                        "model": self.model_id,
                        "messages": messages,
                        "stream": False,
                        "options": {**self.generation_kwargs, **kwargs},
                    }
                    response = self._client.post(
                        f"{self.base_url}/api/chat",
                        json=payload,
                        timeout=self.timeout,
                    )
                    response.raise_for_status()
                    result = response.json()
                    text = result["message"]["content"]
                    generations_for_input.append(text)
                except Exception as e:
                    self._logger.warning(f"Generation thất bại: {e}")
                    generations_for_input.append(None)

            outputs.append(generations_for_input)

        return outputs
```

---

## 3. Sử dụng trong Pipeline

```python
from distilabel.pipeline import Pipeline
from distilabel.steps import LoadDataFromDicts
from distilabel.steps.tasks import TextGeneration

ollama_llm = CustomOllamaLLM(
    model_id="llama3.2:3b",
    base_url="http://localhost:11434",
    generation_kwargs={"temperature": 0.7, "num_predict": 512},
)

with Pipeline("local-ollama-pipeline") as pipeline:
    load_data = LoadDataFromDicts(
        data=[
            {"instruction": "Giải thích quantum entanglement bằng tiếng Việt."},
            {"instruction": "Viết một hàm Python tính số Fibonacci."},
            {"instruction": "Phân tích ưu điểm của kiến trúc Transformer."},
        ],
    )

    generate = TextGeneration(
        llm=ollama_llm,
        num_generations=1,
        input_batch_size=3,
    )

    load_data >> generate

if __name__ == "__main__":
    distiset = pipeline.run()
    print(distiset["generate_0"].to_pandas()[["instruction", "generation"]])
```

---

## 4. Async LLM cho throughput cao hơn

Nếu provider hỗ trợ async (như hầu hết HTTP API), override `agenerate()` để distilabel tự động gọi song song:

```python
import asyncio
import aiohttp

class AsyncOllamaLLM(CustomOllamaLLM):

    async def agenerate(
        self,
        input: FormattedInput,
        num_generations: int = 1,
        **kwargs,
    ) -> GenerateOutput:
        """Async version: nhiều calls chạy song song trong cùng một batch."""
        async with aiohttp.ClientSession() as session:
            tasks = []
            for _ in range(num_generations):
                payload = {
                    "model": self.model_id,
                    "messages": input,
                    "stream": False,
                    "options": {**self.generation_kwargs, **kwargs},
                }
                tasks.append(
                    session.post(
                        f"{self.base_url}/api/chat",
                        json=payload,
                        timeout=aiohttp.ClientTimeout(total=self.timeout),
                    )
                )

            results = await asyncio.gather(*tasks, return_exceptions=True)
            outputs = []
            for result in results:
                if isinstance(result, Exception):
                    outputs.append(None)
                else:
                    data = await result.json()
                    outputs.append(data["message"]["content"])

            return outputs
```

distilabel tự detect `agenerate()` và sẽ gọi nó thay vì `generate()` cho toàn bộ batch, tận dụng asyncio để tăng throughput đáng kể so với gọi tuần tự.

---

## 5. Checklist khi viết Custom LLM

- `model_name` property trả về string nhất quán (dùng cho logging, metadata).
- `load()` phải gọi `super().load()` để khởi tạo `self._logger`.
- `generate()` luôn trả về list có độ dài bằng `len(inputs)`, mỗi phần tử là list `num_generations` strings.
- Trả về `None` thay vì raise exception khi một generation thất bại (pipeline xử lý gracefully).
- `unload()` giải phóng tất cả resources (connections, GPU memory).
- Dùng `pydantic.Field` cho tất cả config attributes để serialization hoạt động đúng.
