package com.provana.catalog.repository;

import com.provana.catalog.entity.ProductMedia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProductMediaRepository extends JpaRepository<ProductMedia, UUID> {

    List<ProductMedia> findByProductIdAndActiveTrueOrderBySortOrderAsc(UUID productId);

    List<ProductMedia> findByProductIdOrderBySortOrderAsc(UUID productId);
}
