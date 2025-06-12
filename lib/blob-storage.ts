import { put, del, list } from "@vercel/blob"

export const blobStorage = {
  // Upload a restaurant image
  async uploadRestaurantImage(file: File, restaurantId: string): Promise<string> {
    try {
      const filename = `restaurants/${restaurantId}/${Date.now()}-${file.name}`
      const blob = await put(filename, file, {
        access: "public",
        handleUploadUrl: "/api/upload",
      })
      return blob.url
    } catch (error) {
      console.error("Error uploading image:", error)
      throw new Error("Failed to upload image")
    }
  },

  // Delete a restaurant image
  async deleteRestaurantImage(url: string): Promise<void> {
    try {
      await del(url)
    } catch (error) {
      console.error("Error deleting image:", error)
      throw new Error("Failed to delete image")
    }
  },

  // List all images for a restaurant
  async listRestaurantImages(restaurantId: string) {
    try {
      const { blobs } = await list({
        prefix: `restaurants/${restaurantId}/`,
      })
      return blobs
    } catch (error) {
      console.error("Error listing images:", error)
      throw new Error("Failed to list images")
    }
  },

  // Upload menu item image
  async uploadMenuImage(file: File, restaurantId: string): Promise<string> {
    try {
      const filename = `restaurants/${restaurantId}/menu/${Date.now()}-${file.name}`
      const blob = await put(filename, file, {
        access: "public",
        handleUploadUrl: "/api/upload",
      })
      return blob.url
    } catch (error) {
      console.error("Error uploading menu image:", error)
      throw new Error("Failed to upload menu image")
    }
  },
}
