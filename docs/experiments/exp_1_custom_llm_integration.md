---
sidebar_position: 2
sidebar_label: "Exp 1: Custom LLM Integration"
---

# Experiment 1: Custom LLM Integration

## Động lực

Distilabel cung cấp sẵn adapter cho OpenAI, Anthropic, HuggingFace Inference Endpoints và nhiều provider khác. Tuy nhiên, trong môi trường production thực tế, thường cần tích hợp với Ollama (chạy model cục bộ), Azure OpenAI (endpoint nội bộ), hoặc REST API tự xây dựng của tổ chức. Experiment này hướng dẫn cách viết custom LLM class để đáp ứng các yêu cầu đó.

## Interface của LLM Base Class

Tất cả LLM trong distilabel kế thừa từ abstract class `LLM`. Contract tối thiểu cần implement gồm hai thành phần:

```python
from abc import abstractmethod
from distilabel.models.llms.base import LLM

class MyLLM(LLM):

    @property
    @abstractmethod
    def model_name(self) -> str:
        # Trả về tên model, dùng cho logging và metadata
        ...

    @abstractmethod
    def generate(
        self,
        inputs: list,        # List[FormattedInput] = List[List[Dict[str, str]]]
        num_generations: int = 1,
        **kwargs,
    ) -> list:               # List[GenerateOutput] = List[List[Optional[str]]]
        # Nhận batch inputs, trả về batch outputs
        # Mỗi input sinh num_generations outputs
        ...
```

`FormattedInput` là danh sách messages theo định dạng OpenAI chat (`[{"role": "user", "content": "..."}]`). `GenerateOutput` là danh sách `num_generations` strings (hoặc `None` nếu generation thất bại).

## Ví dụ: Tích hợp Ollama

Ollama cho phép chạy các LLM open-weight cục bộ qua REST API. Đây là implementation đầy đủ:

```python
import requests
from typing import List, Optional
from pydantic import Field
from distilabel.models.llms.base import LLM

class OllamaLLM(LLM):
    """LLM adapter cho Ollama local server."""

    model_id: str = Field(
        description="Tên model trong Ollama, ví dụ: llama3.2:3b, mistral"
    )
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
        super().load()   # bắt buộc: khởi tạo self._logger
        self._client = requests.Session()
        self._client.headers.update({"Content-Type": "application/json"})
        try:
            resp = self._client.get(f"{self.base_url}/api/tags", timeout=5)
            resp.raise_for_status()
            self._logger.info(f"Kết nối Ollama thành công: {self.base_url}")
        except requests.RequestException as exc:
            raise RuntimeError(f"Không thể kết nối Ollama: {exc}") from exc

    def unload(self) -> None:
        if self._client is not None:
            self._client.close()
            self._client = None

    def generate(
        self,
        inputs: List,
        num_generations: int = 1,
        **kwargs,
    ) -> List:
        outputs = []
        for messages in inputs:
            gens = []
            for _ in range(num_generations):
                try:
                    payload = {
                        "model": self.model_id,
                        "messages": messages,
                        "stream": False,
                        "options": {**self.generation_kwargs, **kwargs},
                    }
                    resp = self._client.post(
                        f"{self.base_url}/api/chat",
                        json=payload,
                        timeout=self.timeout,
                    )
                    resp.raise_for_status()
                    gens.append(resp.json()["message"]["content"])
                except Exception as exc:
                    self._logger.warning(f"Generation thất bại: {exc}")
                    gens.append(None)   # trả về None thay vì raise
            outputs.append(gens)
        return outputs
```

## Sử dụng trong Pipeline

```python
from distilabel.pipeline import Pipeline
from distilabel.steps import LoadDataFromDicts
from distilabel.steps.tasks import TextGeneration

ollama = OllamaLLM(
    model_id="llama3.2:3b",
    generation_kwargs={"temperature": 0.7, "num_predict": 512},
)

with Pipeline(name="ollama-pipeline") as pipeline:
    load = LoadDataFromDicts(
        data=[
            {"instruction": "Giải thích cơ chế attention trong Transformer."},
            {"instruction": "So sánh DPO và PPO cho RLHF."},
        ],
    )
    gen = TextGeneration(llm=ollama, num_generations=1)
    load >> gen

if __name__ == "__main__":
    distiset = pipeline.run()
    print(distiset["generate_0"].to_pandas()[["instruction", "generation"]])
```

## Checklist khi viết Custom LLM

Bảng dưới tổng hợp các điểm bắt buộc và khuyến nghị khi implement custom LLM class:

| Yêu cầu | Lý do |
|---|---|
| Gọi `super().load()` trong `load()` | Khởi tạo `self._logger` |
| Trả về `None` khi generation lỗi | Pipeline xử lý gracefully, không crash |
| Dùng `pydantic.Field` cho config | Serialization và deserialization hoạt động |
| `len(output) == len(inputs)` | Contract bắt buộc của `generate()` |
| `len(output[i]) == num_generations` | Mỗi input phải có đúng số outputs |
| Giải phóng resources trong `unload()` | Tránh memory leak khi pipeline kết thúc |

## Nâng cao: Async generation

Nếu provider hỗ trợ async, override `agenerate()` để tăng throughput:

```python
import asyncio, aiohttp

class AsyncOllamaLLM(OllamaLLM):
    async def agenerate(self, input: list, num_generations: int = 1, **kwargs) -> list:
        async with aiohttp.ClientSession() as session:
            tasks = [
                session.post(
                    f"{self.base_url}/api/chat",
                    json={"model": self.model_id, "messages": input, "stream": False},
                    timeout=aiohttp.ClientTimeout(total=self.timeout),
                )
                for _ in range(num_generations)
            ]
            results = await asyncio.gather(*tasks, return_exceptions=True)
            return [
                None if isinstance(r, Exception) else (await r.json())["message"]["content"]
                for r in results
            ]
```

Distilabel tự detect `agenerate()` và gọi nó thay vì `generate()`, cho phép các calls trong cùng một batch chạy song song, tăng throughput đáng kể so với gọi tuần tự.
