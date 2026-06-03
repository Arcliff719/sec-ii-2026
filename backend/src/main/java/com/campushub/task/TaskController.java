package com.campushub.task;

import com.campushub.common.ApiResponse;
import com.campushub.common.PageResult;
import com.campushub.util.UserContext;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

/**
 * 需求（Task）REST 控制器 — 需求发布板块的入口层.
 */
@RestController
@RequestMapping("/v1/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    /** 发布需求 */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<TaskDTO> createTask(@Valid @RequestBody TaskCreateRequest request) {
        Long userId = UserContext.getCurrentUserId();
        return ApiResponse.success(taskService.createTask(request, userId));
    }

    /** 删除自己发布的需求 */
    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteTask(@PathVariable Long id) {
        Long userId = UserContext.getCurrentUserId();
        taskService.deleteOwnTask(userId, id);
        return ApiResponse.success("删除成功", null);
    }

    /** 需求列表（公开） */
    @GetMapping
    public ApiResponse<PageResult<TaskDTO>> listTasks(
            @RequestParam(required = false) Integer categoryId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "latest") String sort,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(name = "page_size", defaultValue = "20") int size) {
        return ApiResponse.success(taskService.listTasks(categoryId, status, keyword, sort, page, size));
    }

    /** 需求详情（公开） */
    @GetMapping("/{id}")
    public ApiResponse<TaskDTO> getTaskDetail(@PathVariable Long id) {
        return ApiResponse.success(taskService.getTaskDetail(id));
    }
}
