package com.provana.catalog.entity;

import com.provana.common.audit.BaseEntity;
import jakarta.persistence.*;

import java.util.UUID;

/**
 * Subcategory strictly mapped under a parent Category (e.g. Whey Isolate under Protein).
 */
@Entity
@Table(name = "subcategories", indexes = {
        @Index(name = "idx_subcategories_category_id", columnList = "category_id"),
        @Index(name = "idx_subcategories_slug", columnList = "slug"),
        @Index(name = "idx_subcategories_active", columnList = "active")
})
public class Subcategory extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 120)
    private String slug;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private boolean active = true;

    @Column(name = "sort_order", nullable = false)
    private int sortOrder = 0;

    public Subcategory() {
    }

    public Subcategory(Category category, String name, String slug, String description, int sortOrder) {
        this.category = category;
        this.name = name;
        this.slug = slug;
        this.description = description;
        this.sortOrder = sortOrder;
        this.active = true;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSlug() {
        return slug;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public boolean isActive() {
        return active;
    }

    public boolean getActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public int getSortOrder() {
        return sortOrder;
    }

    public void setSortOrder(int sortOrder) {
        this.sortOrder = sortOrder;
    }
}
