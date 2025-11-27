package com.example.ai_backend;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.GetMapping;


//exposes REST endpoints in frontend.This is an API layer between JS and LlmService

@RestController
@RequestMapping
@CrossOrigin(origins = "*")//allows all orgiins like live server,etc
public class ChatController {
    private final LlmService llmService;
    public ChatController(LlmService llmService) {
        this.llmService = llmService;
    }

    //Small request/response records

    public record ChatRequest(String message) {
    }
    public record ChatResponse(String reply) {
    }

    public record AnalyseRequest(String question, String fileContent) {
    }
    public record AnalyzeResponse(String analysis) {
    }

    public record HealthResponse(String status) {
    }

    //chat enpoint

    @PostMapping("/chat")
    public ChatResponse chat(@RequestBody ChatRequest request) {
        String answer = llmService.ask(request.message());
        return new ChatResponse(answer);
    }

    @PostMapping("/analyze")
    public AnalyzeResponse analyze(@RequestBody AnalyseRequest request) {
        String analysis = llmService.analyze(request.question(), request.fileContent());
        return new AnalyzeResponse(analysis);
    }

    //health check endpoint
    @GetMapping("/health")
    public HealthResponse health() {
        return new HealthResponse("OK");
    }
}