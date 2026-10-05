package com.provana.catalog.service;

import com.provana.catalog.dto.ProductFaqRequest;
import com.provana.catalog.dto.ProductFaqResponse;
import com.provana.catalog.entity.Product;
import com.provana.catalog.entity.ProductFaq;
import com.provana.catalog.repository.ProductFaqRepository;
import com.provana.catalog.repository.ProductRepository;
import com.provana.common.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class ProductFaqService {

    private final ProductFaqRepository faqRepository;
    private final ProductRepository productRepository;

    public ProductFaqService(ProductFaqRepository faqRepository, ProductRepository productRepository) {
        this.faqRepository = faqRepository;
        this.productRepository = productRepository;
    }

    @Transactional(readOnly = true)
    public List<ProductFaqResponse> getFaqsByProductId(UUID productId, boolean activeOnly) {
        List<ProductFaq> faqs = activeOnly
                ? faqRepository.findByProductIdAndActiveTrueOrderBySortOrderAsc(productId)
                : faqRepository.findByProductIdOrderBySortOrderAsc(productId);

        return faqs.stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional
    public ProductFaqResponse addFaq(ProductFaqRequest request) {
        Product product = productRepository.findById(request.productId())
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", request.productId()));

        ProductFaq faq = new ProductFaq();
        faq.setProduct(product);
        faq.setQuestion(request.question());
        faq.setAnswer(request.answer());
        if (request.sortOrder() != null) {
            faq.setSortOrder(request.sortOrder());
        }
        if (request.active() != null) {
            faq.setActive(request.active());
        }

        ProductFaq saved = faqRepository.save(faq);
        return mapToResponse(saved);
    }

    @Transactional
    public void deleteFaq(UUID id) {
        ProductFaq faq = faqRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ProductFaq", "id", id));
        faqRepository.delete(faq);
    }

    public ProductFaqResponse mapToResponse(ProductFaq faq) {
        return new ProductFaqResponse(
                faq.getId(),
                faq.getQuestion(),
                faq.getAnswer(),
                faq.getSortOrder(),
                faq.getActive()
        );
    }
}
