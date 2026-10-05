package com.provana.catalog.repository;

import com.provana.catalog.entity.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProductVariantRepository extends JpaRepository<ProductVariant, UUID> {

    List<ProductVariant> findByProductIdAndActiveTrueOrderBySortOrderAsc(UUID productId);

    List<ProductVariant> findByProductIdOrderBySortOrderAsc(UUID productId);
}
