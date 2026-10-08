package com.provana.catalog.service;

import com.provana.catalog.dto.*;
import com.provana.catalog.entity.*;
import com.provana.catalog.repository.*;
import com.provana.common.exception.BadRequestException;
import com.provana.common.exception.DuplicateResourceException;
import com.provana.common.exception.ResourceNotFoundException;
import com.provana.common.response.PageResponse;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final BrandRepository brandRepository;
    private final CategoryRepository categoryRepository;
    private final SubcategoryRepository subcategoryRepository;
    private final BrandService brandService;
    private final CategoryService categoryService;
    private final SubcategoryService subcategoryService;
    private final ProductVariantService variantService;
    private final ProductMediaService mediaService;
    private final ProductNutritionService nutritionService;
    private final ProductFaqService faqService;
    private final com.provana.inventory.repository.InventoryRepository inventoryRepository;

    public ProductService(ProductRepository productRepository,
                          BrandRepository brandRepository,
                          CategoryRepository categoryRepository,
                          SubcategoryRepository subcategoryRepository,
                          BrandService brandService,
                          CategoryService categoryService,
                          SubcategoryService subcategoryService,
                          ProductVariantService variantService,
                          ProductMediaService mediaService,
                          ProductNutritionService nutritionService,
                          ProductFaqService faqService,
                          com.provana.inventory.repository.InventoryRepository inventoryRepository) {
        this.productRepository = productRepository;
        this.brandRepository = brandRepository;
        this.categoryRepository = categoryRepository;
        this.subcategoryRepository = subcategoryRepository;
        this.brandService = brandService;
        this.categoryService = categoryService;
        this.subcategoryService = subcategoryService;
        this.variantService = variantService;
        this.mediaService = mediaService;
        this.nutritionService = nutritionService;
        this.faqService = faqService;
        this.inventoryRepository = inventoryRepository;
    }

    // ==========================================
    // CUSTOMER CATALOGUE APIS (PUBLISHED ONLY)
    // ==========================================

    @Transactional(readOnly = true)
    public PageResponse<ProductSummaryResponse> listCustomerProducts(
            String categorySlug,
            String subcategorySlug,
            String brandSlug,
            String goalTag,
            String search,
            Pageable pageable) {

        Specification<Product> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Strictly PUBLISHED products only for customer APIs
            predicates.add(cb.equal(root.get("status"), ProductStatus.PUBLISHED));
            predicates.add(cb.isTrue(root.get("category").get("active")));
            predicates.add(cb.isTrue(root.get("brand").get("active")));

            if (categorySlug != null && !categorySlug.isBlank()) {
                predicates.add(cb.equal(root.get("category").get("slug"), categorySlug.trim().toLowerCase()));
            }

            if (subcategorySlug != null && !subcategorySlug.isBlank()) {
                predicates.add(cb.equal(root.get("subcategory").get("slug"), subcategorySlug.trim().toLowerCase()));
                predicates.add(cb.isTrue(root.get("subcategory").get("active")));
            }

            if (brandSlug != null && !brandSlug.isBlank()) {
                predicates.add(cb.equal(root.get("brand").get("slug"), brandSlug.trim().toLowerCase()));
            }

            if (goalTag != null && !goalTag.isBlank()) {
                predicates.add(cb.equal(cb.lower(root.get("goalTag")), goalTag.trim().toLowerCase()));
            }

            if (search != null && !search.isBlank()) {
                String searchPattern = "%" + search.trim().toLowerCase() + "%";
                Predicate nameMatch = cb.like(cb.lower(root.get("name")), searchPattern);
                Predicate descMatch = cb.like(cb.lower(root.get("description")), searchPattern);
                Predicate highlightMatch = cb.like(cb.lower(root.get("highlight")), searchPattern);
                predicates.add(cb.or(nameMatch, descMatch, highlightMatch));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Product> page = productRepository.findAll(spec, pageable);
        return PageResponse.from(page.map(this::mapToSummaryResponse));
    }

    @Transactional(readOnly = true)
    public ProductDetailResponse getCustomerProductBySlug(String slug) {
        Product product = productRepository.findBySlugAndStatus(slug, ProductStatus.PUBLISHED)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "slug", slug));

        return mapToDetailResponse(product, true);
    }

    // ==========================================
    // ADMIN CATALOGUE APIS
    // ==========================================

    @Transactional(readOnly = true)
    public PageResponse<ProductSummaryResponse> listAdminProducts(
            ProductStatus status,
            String search,
            Pageable pageable) {

        Specification<Product> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            if (search != null && !search.isBlank()) {
                String searchPattern = "%" + search.trim().toLowerCase() + "%";
                Predicate nameMatch = cb.like(cb.lower(root.get("name")), searchPattern);
                Predicate slugMatch = cb.like(cb.lower(root.get("slug")), searchPattern);
                predicates.add(cb.or(nameMatch, slugMatch));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Product> page = productRepository.findAll(spec, pageable);
        return PageResponse.from(page.map(this::mapToSummaryResponse));
    }

    @Transactional(readOnly = true)
    public ProductDetailResponse getAdminProductById(UUID id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));

        return mapToDetailResponse(product, false);
    }

    @Transactional
    public ProductDetailResponse createProduct(CreateProductRequest request) {
        if (productRepository.existsBySlug(request.slug())) {
            throw new DuplicateResourceException("Product", "slug", request.slug());
        }

        Brand brand = brandRepository.findById(request.brandId())
                .orElseThrow(() -> new ResourceNotFoundException("Brand", "id", request.brandId()));

        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.categoryId()));

        Subcategory subcategory = null;
        if (request.subcategoryId() != null) {
            subcategory = subcategoryRepository.findById(request.subcategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Subcategory", "id", request.subcategoryId()));

            // Validate subcategory / category consistency
            if (!subcategory.getCategory().getId().equals(category.getId())) {
                throw new BadRequestException(String.format(
                        "Subcategory '%s' does not belong to Category '%s'",
                        subcategory.getName(),
                        category.getName()
                ));
            }
        }

        Product product = new Product();
        product.setName(request.name());
        product.setSlug(request.slug().toLowerCase().trim());
        product.setBrand(brand);
        product.setCategory(category);
        product.setSubcategory(subcategory);
        product.setGoalTag(request.goalTag());
        product.setBadge(request.badge());
        product.setHighlight(request.highlight());
        product.setDescription(request.description());
        product.setMinimalDesc(request.minimalDesc());
        product.setBenefits(request.benefits());
        product.setUsageInstructions(request.usageInstructions());
        product.setIngredients(request.ingredients());
        product.setAllergens(request.allergens());
        if (request.status() != null) {
            product.setStatus(request.status());
        }
        product.setMetaTitle(request.metaTitle());
        product.setMetaDescription(request.metaDescription());

        Product saved = productRepository.save(product);
        return mapToDetailResponse(saved, false);
    }

    @Transactional
    public ProductDetailResponse updateProduct(UUID id, UpdateProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));

        if (request.slug() != null && productRepository.existsBySlugAndIdNot(request.slug(), id)) {
            throw new DuplicateResourceException("Product", "slug", request.slug());
        }

        if (request.name() != null) product.setName(request.name());
        if (request.slug() != null) product.setSlug(request.slug().toLowerCase().trim());

        if (request.brandId() != null) {
            Brand brand = brandRepository.findById(request.brandId())
                    .orElseThrow(() -> new ResourceNotFoundException("Brand", "id", request.brandId()));
            product.setBrand(brand);
        }

        if (request.categoryId() != null) {
            Category category = categoryRepository.findById(request.categoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.categoryId()));
            product.setCategory(category);
        }

        if (request.subcategoryId() != null) {
            Subcategory subcategory = subcategoryRepository.findById(request.subcategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Subcategory", "id", request.subcategoryId()));

            if (!subcategory.getCategory().getId().equals(product.getCategory().getId())) {
                throw new BadRequestException(String.format(
                        "Subcategory '%s' does not belong to Category '%s'",
                        subcategory.getName(),
                        product.getCategory().getName()
                ));
            }
            product.setSubcategory(subcategory);
        }

        if (request.goalTag() != null) product.setGoalTag(request.goalTag());
        if (request.badge() != null) product.setBadge(request.badge());
        if (request.highlight() != null) product.setHighlight(request.highlight());
        if (request.description() != null) product.setDescription(request.description());
        if (request.minimalDesc() != null) product.setMinimalDesc(request.minimalDesc());
        if (request.benefits() != null) product.setBenefits(request.benefits());
        if (request.usageInstructions() != null) product.setUsageInstructions(request.usageInstructions());
        if (request.ingredients() != null) product.setIngredients(request.ingredients());
        if (request.allergens() != null) product.setAllergens(request.allergens());
        if (request.status() != null) product.setStatus(request.status());
        if (request.metaTitle() != null) product.setMetaTitle(request.metaTitle());
        if (request.metaDescription() != null) product.setMetaDescription(request.metaDescription());

        Product updated = productRepository.save(product);
        return mapToDetailResponse(updated, false);
    }

    @Transactional
    public ProductDetailResponse updateProductStatus(UUID id, ProductStatus status) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));

        product.setStatus(status);
        if (status == ProductStatus.PUBLISHED && product.getPublishedAt() == null) {
            product.setPublishedAt(Instant.now());
        }

        Product updated = productRepository.save(product);
        return mapToDetailResponse(updated, false);
    }

    @Transactional
    public void deleteProduct(UUID id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        if (product.getVariants() != null) {
            for (ProductVariant v : product.getVariants()) {
                if (v.getSkus() != null) {
                    for (Sku s : v.getSkus()) {
                        inventoryRepository.findBySkuId(s.getId()).ifPresent(inventoryRepository::delete);
                    }
                }
            }
        }
        productRepository.delete(product);
    }

    // ==========================================
    // MAPPERS
    // ==========================================

    public ProductSummaryResponse mapToSummaryResponse(Product product) {
        BigDecimal startingPrice = null;
        BigDecimal compareAtPrice = null;

        if (product.getVariants() != null) {
            for (ProductVariant v : product.getVariants()) {
                if (Boolean.TRUE.equals(v.getActive()) && v.getSkus() != null) {
                    for (Sku s : v.getSkus()) {
                        if (Boolean.TRUE.equals(s.getActive()) && Boolean.TRUE.equals(s.getAvailable())) {
                            if (startingPrice == null || s.getPrice().compareTo(startingPrice) < 0) {
                                startingPrice = s.getPrice();
                                compareAtPrice = s.getCompareAtPrice();
                            }
                        }
                    }
                }
            }
        }

        String primaryImageUrl = null;
        if (product.getMedia() != null && !product.getMedia().isEmpty()) {
            primaryImageUrl = product.getMedia().stream()
                    .filter(m -> Boolean.TRUE.equals(m.getActive()) && Boolean.TRUE.equals(m.getIsPrimary()))
                    .map(ProductMedia::getUrl)
                    .findFirst()
                    .orElseGet(() -> product.getMedia().stream()
                            .filter(m -> Boolean.TRUE.equals(m.getActive()))
                            .map(ProductMedia::getUrl)
                            .findFirst()
                            .orElse(null));
        }

        return new ProductSummaryResponse(
                product.getId(),
                product.getName(),
                product.getSlug(),
                product.getBrand().getId(),
                product.getBrand().getName(),
                product.getCategory().getId(),
                product.getCategory().getName(),
                product.getSubcategory() != null ? product.getSubcategory().getId() : null,
                product.getSubcategory() != null ? product.getSubcategory().getName() : null,
                product.getGoalTag(),
                product.getBadge(),
                product.getHighlight(),
                product.getMinimalDesc(),
                product.getStatus(),
                startingPrice,
                compareAtPrice,
                primaryImageUrl,
                0.0, // Default rating score until review module
                0,   // Default review count until review module
                product.getCreatedAt()
        );
    }

    public ProductDetailResponse mapToDetailResponse(Product product, boolean activeOnly) {
        var variants = variantService.getVariantsByProductId(product.getId(), activeOnly);
        var media = mediaService.getMediaByProductId(product.getId(), activeOnly);
        var nutrition = nutritionService.getNutritionByProductId(product.getId());
        var faqs = faqService.getFaqsByProductId(product.getId(), activeOnly);

        return new ProductDetailResponse(
                product.getId(),
                product.getName(),
                product.getSlug(),
                brandService.mapToResponse(product.getBrand()),
                categoryService.mapToResponse(product.getCategory()),
                product.getSubcategory() != null ? subcategoryService.mapToResponse(product.getSubcategory()) : null,
                product.getGoalTag(),
                product.getBadge(),
                product.getHighlight(),
                product.getDescription(),
                product.getMinimalDesc(),
                product.getBenefits(),
                product.getUsageInstructions(),
                product.getIngredients(),
                product.getAllergens(),
                product.getStatus(),
                product.getMetaTitle(),
                product.getMetaDescription(),
                product.getPublishedAt(),
                variants,
                media,
                nutrition,
                faqs,
                product.getCreatedAt(),
                product.getUpdatedAt()
        );
    }
}
