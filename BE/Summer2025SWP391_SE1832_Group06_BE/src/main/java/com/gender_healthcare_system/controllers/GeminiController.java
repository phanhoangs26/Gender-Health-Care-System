package com.gender_healthcare_system.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gender_healthcare_system.services.GeminiService;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.tags.Tag;

@Tag(name = "Gemini Chat", description = "Endpoints for Gemini AI chat and session management")
@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class GeminiController {

    private final GeminiService geminiService;

    @Operation(summary = "Send a message to Gemini with a persistent user session (multi-turn chat)",
        description = "Send a message to Gemini AI and receive a reply. Maintains a session per user.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Gemini's reply as String",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = String.class))),
        @ApiResponse(responseCode = "400", description = "Invalid input", content = @Content),
        @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content)
    })
    @PostMapping("/{userId}")
    public ResponseEntity<String> chat(
            @Parameter(description = "The ID of the user") @PathVariable String userId,
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                description = "Message payload for chat request",
                required = true,
                content = @Content(schema = @Schema(implementation = MessageRequest.class))
            )
            @RequestBody MessageRequest request) {
        String response = geminiService.sendMessage(userId, request.getMessage());
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Clear a user's chat session",
        description = "Clear the chat session for a specific user.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Session cleared message",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = String.class)))
    })
    @DeleteMapping("/{userId}")
    public ResponseEntity<String> clearSession(
            @Parameter(description = "The ID of the user") @PathVariable String userId) {
        geminiService.clearSession(userId);
        return ResponseEntity.ok("Session cleared for user: " + userId);
    }

    /**
     * Message payload for chat request
     */
    @Data
    @AllArgsConstructor
    @Schema(description = "Message payload for chat request")
    public static class MessageRequest {
        @Schema(description = "The message sent from the user", example = "Hello Gemini!")
        private String message;
    }

    @Operation(summary = "Get a user's chat history",
        description = "Retrieve the chat history for a specific user.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Chat history",
            content = @Content(mediaType = "application/json"))
    })
    @GetMapping("/{userId}/history")
    public ResponseEntity<?> getHistory(
            @Parameter(description = "The ID of the user") @PathVariable String userId) {
        return ResponseEntity.ok(geminiService.getSessionHistory(userId));
    }

    
}
