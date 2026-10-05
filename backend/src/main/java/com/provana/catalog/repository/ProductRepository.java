package com.provana.catalog.repository;

import com.provana.catalog.entity.Product;
import com.provana.catalog.entity.ProductStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProductRepository extends JpaRepository<Product, UUID>, JpaSpecificationExecutor<Product> {

    Optional<Product> findBySlug(String slug);

    Optional<Product> findBySlugAndStatus(String slug, ProductStatus status);

    boolean existsBySlug(String slug);

    boolean existsBySlugAndIdNot(String slug, UUID id);

    long countByCategoryId(UUID categoryId);

    long countBySubcategoryId(UUID subcategoryId);

    long countByBrandId(UUID brandId);

    Page<Product> findByStatus(ProductStatus status, Pageable pageable);
}
