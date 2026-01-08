package com.gender_healthcare_system.dtos.todo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ImageUploadDTO implements Serializable {

    private String publicId; // img/avatar_01
    private String url; // https://res.cloudinary.com/dzj3q1v2f/image/upload/v1699999999/img/avatar_01.jpg
    private String format; // jpg, png, etc.
    private String resourceType; // image, video, etc.
    private Long bytes; // size in bytes

}
