package com.gender_healthcare_system.dtos.todo;

import lombok.Data;

import java.util.List;

@Data
public class GeminiResponseDTO {
    private List<Candidate> candidates;

    @Data
    public static class Candidate {
        private Content content;
    }

    @Data
    public static class Content {
        private List<Part> parts;
    }

    @Data
    public static class Part {
        private String text;
    }
}

// Ví dụ về cách sử dụng DTO này trong JSON
// {
//     "candidates": [
//         {
//             "content": {
//                 "parts": [
//                     { "text": "Xin chào" },
//                     { "text": "Bạn khỏe không?" }
//                 ]
//             }
//         },
//         {
//             "content": {
//                 "parts": [
//                     { "text": "Đây là một ví dụ khác." }
//                 ]
//             }
//         }
//     ]
// }

