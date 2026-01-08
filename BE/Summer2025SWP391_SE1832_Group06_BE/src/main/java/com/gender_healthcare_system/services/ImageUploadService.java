package com.gender_healthcare_system.services;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.gender_healthcare_system.dtos.todo.ImageUploadDTO;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
@AllArgsConstructor
public class ImageUploadService {

    private final Cloudinary cloudinary;

    // upload image to Cloudinary
    public ImageUploadDTO uploadImage(MultipartFile file, String folder) throws IOException {

        Map<?, ?> result = cloudinary.uploader().upload(
                file.getBytes(),
                ObjectUtils.asMap("resource_type", "auto",
                        "folder", folder)          // ví dụ "img"
        );

        return mapToDTO(result);
    }

    //replace image in Cloudinary
    public ImageUploadDTO replaceImage(MultipartFile file, String folder, String publicId) throws IOException {

        String fullPublicId = folder + "/" + publicId;        // img/avatar_001

        Map<?, ?> result = cloudinary.uploader().upload(
                file.getBytes(),
                ObjectUtils.asMap("resource_type", "auto",
                        "folder", folder,
                        "public_id", fullPublicId, // giữ nguyên public_id cũ
                        "overwrite", true)
        );

        return mapToDTO(result);
    }

    // delete image in Cloudinary
    public boolean deleteImage(String fullPublicId) throws IOException {
        Map<?, ?> result = cloudinary.uploader().destroy(
                fullPublicId,
                ObjectUtils.asMap("invalidate", true));       // xoá cả CDN
        return "ok".equals(result.get("result"));                 // true nếu xoá thành công
    }

    /* ---------- Hàm tiện ích chuyển Map → DTO ---------- */
    private ImageUploadDTO mapToDTO(Map<?, ?> r) {
        return new ImageUploadDTO(
                (String) r.get("public_id"),
                (String) r.get("secure_url"),
                (String) r.get("format"),
                (String) r.get("resource_type"),
                ((Number) r.get("bytes")).longValue()
        );
    }
}
