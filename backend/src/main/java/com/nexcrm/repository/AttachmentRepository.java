package com.nexcrm.repository;

import com.nexcrm.model.Attachment;
import com.nexcrm.model.Task;
import com.nexcrm.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AttachmentRepository extends JpaRepository<Attachment, Long> {
    List<Attachment> findByTask(Task task);
    List<Attachment> findByUploadedBy(User user);
    Optional<Attachment> findByUniqueIdentifier(String uniqueIdentifier);
} 