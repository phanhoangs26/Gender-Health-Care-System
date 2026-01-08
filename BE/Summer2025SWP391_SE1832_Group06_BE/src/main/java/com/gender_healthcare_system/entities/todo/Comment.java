package com.gender_healthcare_system.entities.todo;

import com.gender_healthcare_system.entities.enu.CommentStatus;
import com.gender_healthcare_system.entities.user.Account;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;
import org.hibernate.annotations.Nationalized;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "Comment")
@ToString(exclude = {"blog", "account", "parentComment"})
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Comment implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "comment_id")
    private int commentId;

    @ManyToOne
    @JoinColumn(name = "blog_id", nullable = false)
    private Blog blog;

    @ManyToOne
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    @Nationalized
    @Column(name = "content", length = 1000, nullable = false)
    private String content;

    @ManyToOne
    @JoinColumn(name = "parent_comment_id")
    private Comment parentComment;

    @OneToMany(mappedBy = "parentComment", cascade = CascadeType.ALL)
    private List<Comment> subComments;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Nationalized
    @Column(name = "edited_content", length = 1000)
    private String edited_Content;

    @Column(name = "edited_at")
    private LocalDateTime editedAt;

    @Column(name = "status", nullable = false, length = 15)
    @Enumerated(EnumType.STRING)
    private CommentStatus status;

    public Comment(int commentId, String content,
                   LocalDateTime createdAt, String edited_Content,
                   LocalDateTime editedAt, CommentStatus status) {
        this.commentId = commentId;
        this.content = content;
        this.createdAt = createdAt;
        this.edited_Content = edited_Content;
        this.editedAt = editedAt;
        this.status = status;
    }
}
