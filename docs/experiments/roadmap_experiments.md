---
sidebar_position: 1
sidebar_label: "Lộ trình Experiments"
---

# Experiments: Các kỹ thuật nâng cao trong distilabel

Phần **Experiments** khám phá các kỹ thuật nâng cao mà các case studies không đề cập đến. Mỗi experiment tập trung vào một vấn đề kỹ thuật cụ thể: tích hợp LLM tùy chỉnh, tối ưu chi phí với structured output, và xử lý pipeline nhiều nhánh phức tạp.

---

## Danh sách Experiments

### Experiment 1: Custom LLM Integration

Viết custom LLM class để tích hợp bất kỳ AI provider nào vào distilabel. Ví dụ: Ollama local server, Together AI, hoặc một REST API tùy chỉnh của doanh nghiệp.

**Học được:** Cơ chế kế thừa từ `LLM` base class, implement `model_name` property và `generate()` method, xử lý async, error handling.

### Experiment 2: Structured Output với JSON Schema

Sử dụng `StructuredOutputConfig` và Outlines để ép LLM trả về output theo schema JSON cố định. Quan trọng khi tạo dataset cần format nghiêm ngặt (function calling dataset, classification labels).

**Học được:** `StructuredOutputConfig`, `OutlinesStructuredOutput`, sự đánh đổi giữa tốc độ generation và constraint strictness.
