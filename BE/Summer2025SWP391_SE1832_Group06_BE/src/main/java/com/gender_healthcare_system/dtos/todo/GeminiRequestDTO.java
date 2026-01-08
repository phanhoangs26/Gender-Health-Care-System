package com.gender_healthcare_system.dtos.todo;

import lombok.Data;

import java.util.List;


@Data
public class GeminiRequestDTO {
    private List<Content> contents;

    @Data
    public static class Content {
        private List<Part> parts;
    }

    @Data
    public static class Part {
        private String text;
    }
}

//ví dụ về cách sử dụng DTO này trong JSON
//lồng các phần tử để tạo thành một cấu trúc phức tạp hơn
/*
    {
        "contents": [
        {
         "parts": [
          { "text": "Xin chào" },
          { "text": "Bạn khỏe không?" }
         ]
        },
        {
        "parts": [
        { "text": "Đây là một ví dụ khác." }
       ]
      }
     ]
 }*/
