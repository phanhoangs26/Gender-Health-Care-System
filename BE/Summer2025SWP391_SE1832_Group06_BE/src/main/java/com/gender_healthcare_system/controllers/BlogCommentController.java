package com.gender_healthcare_system.controllers;

import com.gender_healthcare_system.services.CommentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;
import org.hibernate.validator.constraints.Length;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Tag(name = "Blog comment APIs", description = "APIs to access and manipulate blog " +
        "comments and subcomments")
@RestController
@RequestMapping("api/v1/blogs/comments")
@AllArgsConstructor
class BlogCommentController {

    private final CommentService commentService;

    @Operation(
            summary = "Get Comments of a Blog",
            description = "Retrieve comments of a blog with" +
                    " pagination, sorting, and ordering options."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "List of comments of a blog " +
                    "retrieved successfully")
    })
    @GetMapping("/blogId/{blogId}")
    @PreAuthorize("hasAnyAuthority('ROLE_MANAGER', 'ROLE_CONSULTANT', 'ROLE_CUSTOMER')")
    public ResponseEntity<Map<String, Object>> getAllBlogComments
            (@PathVariable int blogId,
             @RequestParam(defaultValue = "0") int page,
             @RequestParam(defaultValue = "commentId") String sort,
             @RequestParam(defaultValue = "asc") String order) {
        return ResponseEntity.ok(
                commentService.getAllBlogComments(blogId, page, sort, order));
    }

    @Operation(
            summary = "Get subcomments of a comment",
            description = "Retrieve subcomments of a comment with" +
                    " pagination, sorting, and ordering options."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "List of subcomments of a " +
                    "comment retrieved successfully")
    })
    @GetMapping("/commentId/{commentId}/subComments")
    @PreAuthorize("hasAnyAuthority('ROLE_MANAGER', 'ROLE_CONSULTANT', 'ROLE_CUSTOMER')")
    public ResponseEntity<Map<String, Object>> getAllSubcommentsOfAComment
            (@PathVariable int commentId,
             @RequestParam(defaultValue = "0") int page,
             @RequestParam(defaultValue = "commentId") String sort,
             @RequestParam(defaultValue = "asc") String order) {
        return ResponseEntity.ok(
                commentService.getAllSubcommentsOfAComment(commentId, page, sort, order));
    }

    @Operation(
            summary = "Create a comment in a blog",
            description = "Allows Consultant or Customer to create a new " +
                    "comment in a blog with initial information."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Comment created successfully")
    })
    @PostMapping("/blogId/{blogId}/create")
    @PreAuthorize("hasAnyAuthority('ROLE_CONSULTANT', 'ROLE_CUSTOMER')")
    public ResponseEntity<String> createACommentInABlog
            (@PathVariable int blogId,
             @RequestParam int accountId,
             @Length(min = 5, max = 1000, message = "Content length must be " +
                     "between 5 to 1000 characters")
             @RequestParam String content) {

        commentService.createANewCommentForABlog(blogId, accountId, content);
        return ResponseEntity.ok("Comment created successfully");
    }

    @Operation(
            summary = "Create a subcomment in a comment of a blog",
            description = "Allows Consultant or Customer to create a new " +
                    "subcomment in a comment of a blog with initial information."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "SubComment created successfully")
    })
    @PostMapping("/commentId/{commentId}/create-subComment")
    @PreAuthorize("hasAnyAuthority('ROLE_CONSULTANT', 'ROLE_CUSTOMER')")
    public ResponseEntity<String> createASubCommentForAComment
            (@PathVariable int commentId,
             @RequestParam int blogId,
             @RequestParam int accountId,
             @Length(min = 5, max = 1000, message = "Content length must be " +
                     "between 5 to 1000 characters")
             @RequestParam String content) {

        commentService.createANewSubCommentForAComment(commentId, blogId, accountId, content);
        return ResponseEntity.ok("Comment created successfully");
    }

    @Operation(
            summary = "Update a comment or a subcomment of a blog",
            description = "Allows Consultant or Customer to update " +
                    "a comment or a subcomment of a blog with initial information."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Comment updated successfully")
    })
    @PostMapping("/commentId/{commentId}/edit")
    @PreAuthorize("hasAnyAuthority('ROLE_CONSULTANT', 'ROLE_CUSTOMER')")
    public ResponseEntity<String> updateACommentOrASubcomment
            (@PathVariable int commentId,
             @RequestParam int accountId,
             @Length(min = 5, max = 1000, message = "New Content length must be " +
                     "between 5 to 1000 characters")
             @RequestParam String newContent) {

        commentService.updateCommentOrSubComment(commentId, accountId, newContent);
        return ResponseEntity.ok("Comment updated successfully");
    }

    @Operation(
            summary = "Remove a comment or a subcomment of a blog by setting status",
            description = "Allows Manager to remove " +
                    "a comment or a subcomment of a blog by setting status to REMOVED."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Comment removed successfully")
    })
    @PutMapping("/commentId/{commentId}/remove")
    @PreAuthorize("hasAnyAuthority('ROLE_MANAGER')")
    public ResponseEntity<String> removeACommentOrASubcomment(@PathVariable int commentId) {

        commentService.removeCommentOrSubComment(commentId);
        return ResponseEntity.ok("Comment removed successfully");
    }
}
