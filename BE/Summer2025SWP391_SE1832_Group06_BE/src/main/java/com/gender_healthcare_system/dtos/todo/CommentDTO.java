package com.gender_healthcare_system.dtos.todo;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.gender_healthcare_system.entities.enu.CommentStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Nationalized;

import java.io.Serializable;
import java.time.LocalDateTime;


@Data
@AllArgsConstructor
@NoArgsConstructor
public class CommentDTO implements Serializable {

    private Integer commentId;

    private Integer accountId;

    private String username;

    @Nationalized
    private String content;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private Long subCommentCount;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private Integer parentCommentId;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy HH:mm")
    @Schema(type = "string", example = "05/06/2025 07:00")
    private LocalDateTime createdAt;

    @Nationalized
    private String edited_Content;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy HH:mm")
    @Schema(type = "string", example = "05/06/2025 07:00")
    private LocalDateTime editedAt;

    private CommentStatus status;

    public CommentDTO(Integer commentId, Long subCommentCount, Integer accountId,
                      String username, String content,
                      LocalDateTime createdAt, String edited_Content, LocalDateTime editedAt,
                      CommentStatus status) {
        this.commentId = commentId;
        this.accountId = accountId;
        this.username = username;
        this.content = content;
        this.subCommentCount = subCommentCount;
        this.createdAt = createdAt;
        this.edited_Content = edited_Content;
        this.editedAt = editedAt;
        this.status = status;
    }

    public CommentDTO(Integer commentId, Integer accountId,
                      String username, String content,
                      Integer parentCommentId, LocalDateTime createdAt,
                      String edited_Content, LocalDateTime editedAt, CommentStatus status) {
        this.commentId = commentId;
        this.content = content;
        this.accountId = accountId;
        this.username = username;
        this.parentCommentId = parentCommentId;
        this.createdAt = createdAt;
        this.edited_Content = edited_Content;
        this.editedAt = editedAt;
        this.status = status;
    }
}
