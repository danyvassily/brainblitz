import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const categoryService = {
  async getCategories() {
    try {
      const response = await axios.get(`${API_URL}/api/categories`);
      return response.data.map((category) => ({
        value: category.name.toLowerCase().replace(/\s+/g, "_"),
        label: category.name,
        description: category.description,
        questions: category.questions,
      }));
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }
  },
};
