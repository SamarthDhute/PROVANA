package com.provana.catalog.service;

import com.provana.catalog.dto.NutritionRequest;
import com.provana.catalog.dto.NutritionResponse;
import com.provana.catalog.entity.Product;
import com.provana.catalog.entity.ProductNutrition;
import com.provana.catalog.repository.ProductNutritionRepository;
import com.provana.catalog.repository.ProductRepository;
import com.provana.common.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class ProductNutritionService {

    private final ProductNutritionRepository nutritionRepository;
    private final ProductRepository productRepository;

    public ProductNutritionService(ProductNutritionRepository nutritionRepository, ProductRepository productRepository) {
        this.nutritionRepository = nutritionRepository;
        this.productRepository = productRepository;
    }

    @Transactional(readOnly = true)
    public NutritionResponse getNutritionByProductId(UUID productId) {
        ProductNutrition nutrition = nutritionRepository.findByProductId(productId)
                .orElse(null);
        return nutrition != null ? mapToResponse(nutrition) : null;
    }

    @Transactional
    public NutritionResponse saveOrUpdateNutrition(UUID productId, NutritionRequest request) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));

        ProductNutrition nutrition = nutritionRepository.findByProductId(productId)
                .orElseGet(() -> {
                    ProductNutrition n = new ProductNutrition();
                    n.setProduct(product);
                    return n;
                });

        nutrition.setServingSize(request.servingSize());
        nutrition.setServingsPerContainer(request.servingsPerContainer());
        nutrition.setCalories(request.calories());
        nutrition.setProteinG(request.proteinG());
        nutrition.setCarbsG(request.carbsG());
        nutrition.setFatG(request.fatG());
        nutrition.setFiberG(request.fiberG());
        nutrition.setSugarG(request.sugarG());
        nutrition.setSodiumMg(request.sodiumMg());
        nutrition.setMetricsJson(request.metricsJson());

        ProductNutrition saved = nutritionRepository.save(nutrition);
        return mapToResponse(saved);
    }

    public NutritionResponse mapToResponse(ProductNutrition nutrition) {
        return new NutritionResponse(
                nutrition.getId(),
                nutrition.getServingSize(),
                nutrition.getServingsPerContainer(),
                nutrition.getCalories(),
                nutrition.getProteinG(),
                nutrition.getCarbsG(),
                nutrition.getFatG(),
                nutrition.getFiberG(),
                nutrition.getSugarG(),
                nutrition.getSodiumMg(),
                nutrition.getMetricsJson()
        );
    }
}
