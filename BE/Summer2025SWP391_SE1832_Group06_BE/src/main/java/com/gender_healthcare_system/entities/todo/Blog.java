package com.gender_healthcare_system.entities.todo;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;

import org.hibernate.annotations.Nationalized;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.gender_healthcare_system.entities.enu.BlogStatus;
import com.gender_healthcare_system.entities.user.Account;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "Blog")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Blog implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "blog_id")
    private int blogId;

    // Relationship with Account (Manager)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manager_id", nullable = false)
    @JsonBackReference // Thêm dòng này để tránh vòng lặp vô hạn khi serialize JSON
    private Account manager;

    @Nationalized
    @Column(name = "title", nullable = false, length = 100)
    private String title;

    @Nationalized
    @Column(name = "content", nullable = false, columnDefinition = "nvarchar(MAX)")
    private String content;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    /*@Nationalized
        @Column(name = "author", nullable = false, length = 50)
        private String author;*/

    @Column(name = "status", nullable = false, length = 15)
    @Enumerated(EnumType.STRING)
    private BlogStatus status;

    @OneToMany(mappedBy = "blog", cascade = CascadeType.ALL)
    private List<Comment> comments;

    public Blog(int blogId, String title, String content,
                LocalDateTime createdAt, BlogStatus status) {
        this.blogId = blogId;
        this.title = title;
        this.content = content;
        this.createdAt = createdAt;
        this.status = status;
    }
}
