package com.campushub.review;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    boolean existsByOrder_Id(Long orderId);
    Optional<Review> findByOrder_Id(Long orderId);
}
