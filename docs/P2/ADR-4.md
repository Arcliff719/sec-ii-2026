
# ADR-4：测试语言选择 Python

## 状态
已接受

## 背景

MVP 三个核心模块（用户管理、需求发布与浏览、订单流程管理）需要在 10 周内完成功能测试和 API 集成测试。

后端为 Java（Spring Boot），前端为 Vue 3。需要确定测试脚本的编写语言和测试框架。候选方案为 Python（pytest）和 Java（JUnit + RestAssured）。

## 决策

采用 **Python 3 + pytest + requests** 作为 API 集成测试和端到端测试的技术栈。

技术栈细节：
- 测试框架：pytest
- HTTP 客户端：requests / httpx
- 断言增强：pytest + built-in assert
- 测试数据管理：pytest fixtures + conftest.py
- 报告：pytest-html / Allure（可选）

后端单元测试仍使用 Java 技术栈（JUnit 5 + Mockito），与业务代码保持同一语言。

## 理由

1. **语法简洁高效**：Python 编写 API 测试用例代码量少（相比 Java 的 JUnit + RestAssured），一个测试文件即可覆盖一个模块的完整 API 流程；pytest 的 fixture 机制简化测试数据准备和清理
2. **与后端语言解耦**：API 测试通过 HTTP 请求与后端交互，不依赖后端 Java 代码，是真正的黑盒测试——更贴近真实用户行为，能发现 Java 代码中无法捕获的集成问题（如 JSON 序列化错误、HTTP 状态码不一致等）
3. **pytest 生态完善**：参数化测试（`@pytest.mark.parametrize`）可高效覆盖订单状态机的多种转换路径；conftest.py 集中管理测试配置（base_url、登录 token），避免重复代码
4. **团队协作友好**：Python 语法可读性高，即使后端开发人员（主要使用 Java）也能快速读懂测试用例，降低测试评审门槛
5. **为什么不统一用 Java/JUnit**：python相比java在测试上代码更简洁，并且python学习难度不高，仅用于测试无需大量配置环境，在零基础的情况下也能快速上手完成测试。
## 后果

- **正面影响**：
  - 测试编写效率高：pytest + requests 组合可快速覆盖 API 的正向/异常场景
  - 测试即文档：Python 测试用例可读性强，可作为 API 行为的活文档
  - CI 集成简单：pytest CLI 输出标准格式，易于集成到 GitLab CI 流水线
- **负面影响**：
  - 测试环境需额外安装 Python 依赖（pytest, requests 等），与后端 Java/Maven 环境分立管理
  - 后端单元测试（JUnit 5）与 API 集成测试（pytest）使用不同语言，无法在同一构建流程中运行所有测试
- **需要关注的风险**：
  - 测试数据准备需与后端数据库协调——建议 pytest 通过 API 创建测试数据（而非直接操作数据库），保持黑盒边界
  - 订单流程测试涉及状态变更，需设计好测试用例的执行顺序和隔离策略（可用 pytest-ordering 或独立 fixtures）

## AI 辅助记录
- AI 初稿内容摘要：从上手难度，语言优势，可能存在的风险三个方面给出理由，且一并给出了完整技术栈和需要配置的环境。
- 人工修订内容：修改了正确的团队编程基础，纠正了不选择其他语言的真实原因。
- 修订理由：AI不了解实际的讨论过程，对团队成员编程基础误判，对否定其他选择原因误判。
