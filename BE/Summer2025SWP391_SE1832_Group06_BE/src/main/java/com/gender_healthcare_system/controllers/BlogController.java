package com.gender_healthcare_system.controllers;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.gender_healthcare_system.dtos.todo.BlogDTO;
import com.gender_healthcare_system.services.BlogService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;

@Tag(name = "Public Blog APIs", description = "APIs to access blogs for general users (public)")
@RestController
@RequestMapping("/api/v1/blogs/public")
@AllArgsConstructor
public class BlogController {

    private final BlogService blogService;

    @Operation(
            summary = "Get all blogs",
            description = "Retrieve all active blogs with pagination, sorting, and ordering options."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "List of blogs retrieved successfully")
    })
    // getAllBlogs
    @GetMapping("")
    public ResponseEntity<Map<String, Object>> getAllBlogsForAnyOne
            (@RequestParam(defaultValue = "0") int page,
             @RequestParam(defaultValue = "blogId") String sort,
             @RequestParam(defaultValue = "asc") String order) {
        return ResponseEntity.ok(blogService.getAllBlogs(page, sort, order));
    }

    @Operation(
            summary = "Get Blog by ID (public)",
            description = "Retrieve a specific blog by its ID for public access."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Blog retrieved successfully"),
            @ApiResponse(responseCode = "404", description = "Blog not found")
    })
    // rename API from getBlogsById to getBlogByIdForAnyOne
    // getBlogsById for any one
    @GetMapping("/{id}")
    public ResponseEntity<BlogDTO> getBlogByIdForAnyOne(@PathVariable int id) {
        BlogDTO blog = blogService.getBlogForCustomerById(id);
        if (blog != null) {
            return ResponseEntity.ok(blog);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @Operation(
            summary = "Search blogs (public)",
            description = "Search for blogs by keyword with pagination, sorting, and ordering options."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Blogs searched successfully")
    })
    // searchBlogs
    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> searchBlogsForAnyOne(
        @RequestParam(defaultValue = "") String keyword,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "blogId") String sort,
        @RequestParam(defaultValue = "asc") String order) {
        return ResponseEntity.ok(blogService.searchBlogs(keyword, page, sort, order));
    }
}
