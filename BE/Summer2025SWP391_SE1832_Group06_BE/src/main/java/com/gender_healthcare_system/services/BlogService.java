package com.gender_healthcare_system.services;

import com.gender_healthcare_system.dtos.todo.BlogDTO;
import com.gender_healthcare_system.entities.enu.BlogStatus;
import com.gender_healthcare_system.entities.todo.Blog;
import com.gender_healthcare_system.entities.user.Account;
import com.gender_healthcare_system.exceptions.AppException;
import com.gender_healthcare_system.payloads.todo.BlogRegisterPayload;
import com.gender_healthcare_system.payloads.todo.BlogUpdatePayload;
import com.gender_healthcare_system.repositories.AccountRepo;
import com.gender_healthcare_system.repositories.BlogRepo;
import com.gender_healthcare_system.utils.UtilFunctions;
import lombok.AllArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@AllArgsConstructor
public class BlogService {

    private final BlogRepo blogRepo;
    private final AccountRepo accountRepo;

    ////////////////////////////// Get all blogs //////////////////////////////
    public Map<String, Object> getAllBlogs(int page, String sortField, String sortOrder) {

        final int itemSize = 10;

        Sort sort = Sort.by(Sort.Direction.ASC, sortField);

        if (sortOrder.equals("desc")) {
            sort = Sort.by(Sort.Direction.DESC, sortField);
        }

        Pageable pageRequest = PageRequest.of(page, itemSize, sort);

        Page<BlogDTO> pageResult = blogRepo.getAllBlogs(pageRequest);

        if (!pageResult.hasContent()) {
            throw new AppException(404, "No Blogs found");
        }

        List<BlogDTO> blogList = pageResult.getContent();

        Map<String, Object> map = new HashMap<>();
        map.put("totalItems", pageResult.getTotalElements());
        map.put("blogs", blogList);
        map.put("totalPages", pageResult.getTotalPages());
        map.put("currentPage", pageResult.getNumber());

        return map;
    }

    ////////////////////////////// Get blog by id //////////////////////////////
    public BlogDTO getBlogForManagerById(int id) {
        return blogRepo.getBlogDetailsById(id)
                .orElseThrow(() -> new AppException(404, "Blog not found with ID " + id));
    }

    public BlogDTO getBlogForCustomerById(int id) {
        return blogRepo.getBlogDetailsActiveById(id)
                .orElseThrow(() -> new AppException(404, "Blog not found with ID " + id));
    }

    ////////////////////////////// Search blogs //////////////////////////////
    public Map<String, Object> searchBlogs
    (String keyword, int page, String sortField, String sortOrder) {

        final int itemSize = 10;

        Sort sort = Sort.by(Sort.Direction.ASC, sortField);

        if (sortOrder.equals("desc")) {
            sort = Sort.by(Sort.Direction.DESC, sortField);
        }

        Pageable pageRequest = PageRequest.of(page, itemSize, sort);

        Page<BlogDTO> pageResult;

        String newKeyword = "%" + keyword + "%";

        pageResult = blogRepo.searchActiveBlogsByTitle
                (newKeyword, BlogStatus.ACTIVE, pageRequest);

        if (!pageResult.hasContent()) {
            throw new AppException(404, "No Blogs found");
        }

        List<BlogDTO> blogList = pageResult.getContent();

        Map<String, Object> map = new HashMap<>();
        map.put("totalItems", pageResult.getTotalElements());
        map.put("blogs", blogList);
        map.put("totalPages", pageResult.getTotalPages());
        map.put("currentPage", pageResult.getNumber());

        return map;
    }

    ////////////////////////////// Create blog //////////////////////////////
    @Transactional(rollbackFor = Exception.class)
    public void createBlog(BlogRegisterPayload payload) {
        Account manager = accountRepo.findById(payload.getManagerId())
                .orElseThrow(() -> new AppException(404, "Manager not found with ID " + payload.getManagerId()));

        Blog blog = new Blog();

        blog.setManager(manager);
        //blog.setAuthor(payload.getAuthor());
        blog.setTitle(payload.getTitle());
        blog.setContent(payload.getContent());
        blog.setCreatedAt(UtilFunctions.getCurrentDateTimeWithTimeZone());

        blog.setStatus(BlogStatus.ACTIVE);

        blogRepo.saveAndFlush(blog);
    }

    ////////////////////////////// Update blog //////////////////////////////
    @Transactional(rollbackFor = Exception.class)
    public void updateBlog(int id, BlogUpdatePayload payload) {
        boolean blogExist = blogRepo.existsById(id);

        if (!blogExist) {
            throw new AppException(404, "Blog not found with ID " + id);
        }

        blogRepo.updateBlogById(id, payload);
    }

    ////////////////////////////// Delete blog //////////////////////////////
    @Transactional(rollbackFor = Exception.class)
    public void deleteBlog(int id) {
        boolean blogExist = blogRepo.existsById(id);

        if (!blogExist) {
            throw new AppException(404, "Blog not found with ID " + id);
        }

        blogRepo.deleteBlogById(id, BlogStatus.DELETED);
    }
}
