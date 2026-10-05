package com.provana.catalog.repository;

import com.provana.catalog.entity.Subcategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SubcategoryRepository extends JpaRepository<Subcategory, UUID> {

    Optional<Subcategory> findBySlug(String slug);

    Optional<Subcategory> findBySlugAndActiveTrue(String slug);

    List<Subcategory> findAllByCategoryIdAndActiveTrueOrderBySortOrderAsc(UUID categoryId);

    List<Subcategory> findAllByActiveTrueOrderBySortOrderAsc();

    boolean existsBySlug(String slug);

    boolean existsBySlugAndIdNot(String slug, UUID id);
}
