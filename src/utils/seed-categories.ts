import { CategoryService, CreateCategoryInput, UpsertTopicInput } from "@/services/category.gql";
import { MEGA_NAV } from "@/data/mega-nav";

/**
 * Seed categories from MEGA_NAV into the database
 * This ensures all expected categories exist in the backend
 */
export async function seedCategoriesFromMegaNav(): Promise<void> {
  console.log("🌱 Starting category seeding from MEGA_NAV...");
  
  try {
    // Get existing categories to avoid duplicates
    const existingCategories = await CategoryService.getCategoriesWithTopics();
    const existingSlugs = new Set(existingCategories.map(cat => cat.slug));
    
    console.log(`📋 Found ${existingCategories.length} existing categories:`, existingSlugs);
    
    // Process each MEGA_NAV category
    for (const [slug, config] of Object.entries(MEGA_NAV)) {
      if (existingSlugs.has(slug)) {
        console.log(`✅ Category '${slug}' already exists, skipping...`);
        continue;
      }
      
      console.log(`🆕 Creating category '${slug}' (${config.root.label})...`);
      
      // Create category first (without topics)
      const categoryData: CreateCategoryInput = {
        name: config.root.label,
        slug: slug,
        description: `${config.root.label} news and articles`,
      };
      
      try {
        const createdCategory = await CategoryService.createCategory(categoryData);
        console.log(`✅ Successfully created category '${slug}'`);
        
        // Extract topics from MEGA_NAV structure
        const topics = [
          ...config.explore.items,
          ...config.shop.items,
          ...config.more.items,
        ].map(item => {
          // Extract topic slug from href (e.g., "/world/asia" -> "asia")
          const topicSlug = item.href.split('/').pop() || item.label.toLowerCase().replace(/\s+/g, '-');
          return {
            slug: topicSlug,
            title: item.label,
            description: `${item.label} in ${config.root.label}`,
            categoryId: createdCategory.id,
          };
        });
        
        // Remove duplicates by slug
        const uniqueTopics = topics.filter((topic, index, arr) => 
          arr.findIndex(t => t.slug === topic.slug) === index
        );
        
        // Create topics for this category
        let topicsCreated = 0;
        for (const topicData of uniqueTopics) {
          try {
            await CategoryService.createTopic(topicData);
            topicsCreated++;
          } catch (topicError) {
            console.error(`❌ Failed to create topic '${topicData.slug}' for category '${slug}':`, topicError);
            // Continue with other topics
          }
        }
        
        console.log(`✅ Successfully created ${topicsCreated}/${uniqueTopics.length} topics for category '${slug}'`);
        
      } catch (error) {
        console.error(`❌ Failed to create category '${slug}':`, error);
        // Continue with other categories even if one fails
      }
    }
    
    console.log("🎉 Category seeding completed!");
    
  } catch (error) {
    console.error("❌ Category seeding failed:", error);
    throw error;
  }
}

/**
 * Get categories with fallback to MEGA_NAV
 * This provides a robust way to always have categories available
 */
export async function getCategoriesWithFallback() {
  try {
    // Try to get categories from backend first
    const categories = await CategoryService.getCategoriesWithTopics();
    
    if (categories.length > 0) {
      console.log("✅ Loaded categories from backend:", categories.length);
      return categories;
    }
    
    // If no categories in backend, seed them first
    console.log("🌱 No categories found in backend, seeding from MEGA_NAV...");
    await seedCategoriesFromMegaNav();
    
    // Try again after seeding
    const seededCategories = await CategoryService.getCategoriesWithTopics();
    if (seededCategories.length > 0) {
      console.log("✅ Loaded seeded categories:", seededCategories.length);
      return seededCategories;
    }
    
    // Final fallback: create categories from MEGA_NAV structure
    console.log("🔄 Using MEGA_NAV as fallback...");
    return createCategoriesFromMegaNav();
    
  } catch (error) {
    console.error("❌ Error loading categories, using MEGA_NAV fallback:", error);
    return createCategoriesFromMegaNav();
  }
}

/**
 * Create category objects from MEGA_NAV structure
 * Used as a fallback when backend is not available
 */
function createCategoriesFromMegaNav() {
  return Object.entries(MEGA_NAV).map(([slug, config]) => {
    // Extract topics from MEGA_NAV structure
    const topics = [
      ...config.explore.items,
      ...config.shop.items,
      ...config.more.items,
    ].map(item => {
      const topicSlug = item.href.split('/').pop() || item.label.toLowerCase().replace(/\s+/g, '-');
      return {
        id: `${slug}-${topicSlug}`,
        slug: topicSlug,
        title: item.label,
        description: `${item.label} in ${config.root.label}`,
        categoryId: slug,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    });
    
    // Remove duplicates by slug
    const uniqueTopics = topics.filter((topic, index, arr) => 
      arr.findIndex(t => t.slug === topic.slug) === index
    );
    
    return {
      id: slug,
      name: config.root.label,
      slug: slug,
      description: `${config.root.label} news and articles`,
      topics: uniqueTopics,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });
}
