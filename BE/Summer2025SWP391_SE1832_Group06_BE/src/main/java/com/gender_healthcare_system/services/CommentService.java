package com.gender_healthcare_system.services;

import com.gender_healthcare_system.dtos.todo.CommentDTO;
import com.gender_healthcare_system.entities.enu.AccountStatus;
import com.gender_healthcare_system.entities.enu.CommentStatus;
import com.gender_healthcare_system.entities.todo.Blog;
import com.gender_healthcare_system.entities.todo.Comment;
import com.gender_healthcare_system.entities.user.Account;
import com.gender_healthcare_system.exceptions.AppException;
import com.gender_healthcare_system.repositories.AccountRepo;
import com.gender_healthcare_system.repositories.BlogRepo;
import com.gender_healthcare_system.repositories.CommentRepo;
import com.gender_healthcare_system.utils.UtilFunctions;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@AllArgsConstructor
public class CommentService {

    private final CommentRepo commentRepo;

    private final BlogRepo blogRepo;

    private final AccountRepo accountRepo;

    public Map<String, Object> getAllBlogComments
            (int blogId, int page, String sortField, String sortOrder) {

        final int itemSize = 20;

        Sort sort = Sort.by(Sort.Direction.ASC, sortField);

        if(sortOrder.equals("desc")){

            sort = Sort.by(Sort.Direction.DESC, sortField);
        }

        Pageable pageRequest = PageRequest.of(page, itemSize, sort);

        Page<CommentDTO> pageResult = commentRepo
                .getAllTopCommentsOfABlog(blogId, pageRequest);

        if (!pageResult.hasContent()) {
            throw new AppException(404, "No Comments of Blog with ID "+ blogId +" found");
        }

        List<CommentDTO> commentList = pageResult.getContent();

        /*for (CommentDTO item: commentList){

            Page<CommentDTO> subCommentResult = commentRepo
                    .getAllSubCommentsOfAComment(item.getCommentId(), pageRequest);

            if(subCommentResult.hasContent()){

                List<CommentDTO> subCommentList = subCommentResult.getContent();

                item.setSubComments(subCommentList);
            }
        }*/

        Map<String, Object> map = new HashMap<>();
        map.put("totalItems", pageResult.getTotalElements());
        map.put("comments", commentList);
        map.put("totalPages", pageResult.getTotalPages());
        map.put("currentPage", pageResult.getNumber());

        return map;
    }

    public Map<String, Object> getAllSubcommentsOfAComment
            (int commentId, int page, String sortField, String sortOrder) {

        final int itemSize = 15;

        Sort sort = Sort.by(Sort.Direction.ASC, sortField);

        if(sortOrder.equals("desc")){

            sort = Sort.by(Sort.Direction.DESC, sortField);
        }

        Pageable pageRequest = PageRequest.of(page, itemSize, sort);

        Page<CommentDTO> pageResult = commentRepo
                .getAllSubCommentsOfAComment(commentId, pageRequest);

        if (!pageResult.hasContent()) {
            throw new AppException(404, "No sub comments found for comment with ID "
                    + commentId);
        }

        List<CommentDTO> subCommentList = pageResult.getContent();

        Map<String, Object> map = new HashMap<>();
        map.put("totalItems", pageResult.getTotalElements());
        map.put("subComments", subCommentList);
        map.put("totalPages", pageResult.getTotalPages());
        map.put("currentPage", pageResult.getNumber());

        return map;
    }

    public void createANewCommentForABlog(int blogId, int accountId, String content){

        Blog blog = blogRepo.getBlogDumpById(blogId)
                .orElseThrow(() -> new AppException(404, "No Blog found with ID "+ blogId));

        Account account = accountRepo.getActiveConsultantOrCustomerAccountById
                (accountId, AccountStatus.ACTIVE)
                .orElseThrow(() -> new AppException(404, "No active Consultant or Customer " +
                        "account found with ID " + accountId));

        Comment comment = new Comment();

        comment.setAccount(account);
        comment.setBlog(blog);
        comment.setContent(content);
        comment.setParentComment(null);
        comment.setCreatedAt(UtilFunctions.getCurrentDateTimeWithTimeZone());
        comment.setEdited_Content(null);
        comment.setEditedAt(null);
        comment.setStatus(CommentStatus.ACTIVE);

        commentRepo.saveAndFlush(comment);

    }

    @Transactional
    public void createANewSubCommentForAComment
            (int commentId, int blogId, int accountId, String content){

        Comment comment = commentRepo.getParentCommentDumpById(commentId)
                .orElseThrow(() -> new AppException(404, "No Comment found with ID "+ commentId));

        Blog blog = blogRepo.getBlogDumpById(blogId)
                .orElseThrow(() -> new AppException(404, "No Blog found with ID "+ blogId));

        Account account = accountRepo.getActiveConsultantOrCustomerAccountById
                        (accountId, AccountStatus.ACTIVE)
                .orElseThrow(() -> new AppException(404, "No active Consultant or Customer " +
                        "account found with ID " + accountId));

        Comment subcomment = new Comment();

        subcomment.setAccount(account);
        subcomment.setBlog(blog);
        subcomment.setContent(content);
        subcomment.setParentComment(comment);
        subcomment.setCreatedAt(UtilFunctions.getCurrentDateTimeWithTimeZone());
        subcomment.setEdited_Content(null);
        subcomment.setEditedAt(null);
        subcomment.setStatus(CommentStatus.ACTIVE);

        commentRepo.saveAndFlush(subcomment);

    }

    @Transactional
    public void updateCommentOrSubComment(int commentId, int accountId, String newContent){

        boolean commentWithAccountIdExist = commentRepo
                .existsByCommentIdAndAccountAccountId(commentId, accountId);

        if(!commentWithAccountIdExist){

            throw new AppException(400, "No Comment found with Comment ID "+ commentId +
                    " and Account ID " + accountId + " or you are trying to edit other people " +
                    "comments");
        }

        LocalDateTime editedCreatedAt = UtilFunctions.getCurrentDateTimeWithTimeZone();

        commentRepo.updateACommentOrSubComment(commentId, newContent, editedCreatedAt);
    }

    @Transactional
    public void removeCommentOrSubComment(int commentId){

        boolean commentExist = commentRepo
                .existsById(commentId);

        if(!commentExist){

            throw new AppException(404, "No Comment found with Comment ID "+ commentId);
        }

        commentRepo.removeACommentOrSubComment(commentId, CommentStatus.REMOVED);
    }
}
