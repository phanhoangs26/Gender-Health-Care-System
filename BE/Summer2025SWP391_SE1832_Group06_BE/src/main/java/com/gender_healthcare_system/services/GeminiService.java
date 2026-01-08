package com.gender_healthcare_system.services;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.gender_healthcare_system.dtos.todo.GeminiRequestDTO;
import com.gender_healthcare_system.dtos.todo.GeminiResponseDTO;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class GeminiService {

    private static final String GEMINI_API_KEY = "AIzaSyAmzf_nuz1FNV_iy72QVZ38J_ZwRtTud6M";
    private static final String GEMINI_URL =
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + GEMINI_API_KEY;

    private final RestTemplate restTemplate = new RestTemplate();

    private final Map<String, List<GeminiRequestDTO.Content>> userSessions = new HashMap<>();

    public String sendMessage(String userId, String message) {
        userSessions.putIfAbsent(userId, new ArrayList<>());

        GeminiRequestDTO.Part part = new GeminiRequestDTO.Part();
        part.setText(message);

        GeminiRequestDTO.Content currentTurn = new GeminiRequestDTO.Content();
        currentTurn.setParts(List.of(part));

        userSessions.get(userId).add(currentTurn);

        GeminiRequestDTO request = new GeminiRequestDTO();
        request.setContents(userSessions.get(userId));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<GeminiRequestDTO> httpEntity = new HttpEntity<>(request, headers);

        ResponseEntity<GeminiResponseDTO> response = restTemplate.exchange(
                GEMINI_URL,
                HttpMethod.POST,
                httpEntity,
                GeminiResponseDTO.class
        );

        if (response.getBody() == null || response.getBody().getCandidates() == null || response.getBody().getCandidates().isEmpty() ||
            response.getBody().getCandidates().get(0).getContent() == null ||
            response.getBody().getCandidates().get(0).getContent().getParts() == null ||
            response.getBody().getCandidates().get(0).getContent().getParts().isEmpty() ||
            response.getBody().getCandidates().get(0).getContent().getParts().get(0).getText() == null) {
            return "Gemini did not return a valid response.";
        }

        String reply = response.getBody()
                .getCandidates()
                .get(0)
                .getContent()
                .getParts()
                .get(0)
                .getText();

        // Thêm câu trả lời vào history
        GeminiRequestDTO.Part replyPart = new GeminiRequestDTO.Part();
        replyPart.setText(reply);

        GeminiRequestDTO.Content replyTurn = new GeminiRequestDTO.Content();
        replyTurn.setParts(List.of(replyPart));

        userSessions.get(userId).add(replyTurn);

        return reply;
    }

        //lấy lại lịch sử chat
        public List<GeminiRequestDTO.Content> getSessionHistory(String userId) {
            return userSessions.getOrDefault(userId, new ArrayList<>());
        }
        
    //xóa 
    public void clearSession(String userId) {
        userSessions.remove(userId);
        }

    
}
