import { NextRequest, NextResponse } from "next/server"
import { put, del } from "@vercel/blob"
import { createAdminClient } from "@/lib/supabase"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Verify admin authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const supabaseAdmin = createAdminClient()
    
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // Verify user is admin
    const { data: adminData, error: adminError } = await supabaseAdmin
      .from("admin_users")
      .select("*")
      .eq("email", user.email)
      .single()

    if (adminError || !adminData) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    // Upload to Vercel Blob with organized path structure
    const timestamp = Date.now()
    const fileExtension = file.name.split('.').pop() || 'jpg'
    const fileName = `${timestamp}.${fileExtension}`
    
    const blob = await put(`restaurant-images/${id}/${fileName}`, file, {
      access: 'public'
    })

    // Get current max display_order
    const { data: existingImages } = await supabaseAdmin
      .from("restaurant_images")
      .select("display_order")
      .eq("restaurant_id", id)
      .order("display_order", { ascending: false })
      .limit(1)

    const nextOrder = existingImages?.[0]?.display_order ? existingImages[0].display_order + 1 : 0

    // Save to database
    const { data: image, error: dbError } = await supabaseAdmin
      .from("restaurant_images")
      .insert({
        restaurant_id: id,
        blob_url: blob.url,
        display_order: nextOrder,
        file_size: file.size,
        is_primary: false
      })
      .select()
      .single()

    if (dbError) {
      // Clean up blob if database insert fails
      await del(blob.url)
      return NextResponse.json({ error: "Failed to save image" }, { status: 500 })
    }

    return NextResponse.json({ image })
  } catch (error) {
    console.error("Error uploading image:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { imageId, updates } = await request.json()

    // Verify admin authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const supabaseAdmin = createAdminClient()
    
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // Verify user is admin
    const { data: adminData, error: adminError } = await supabaseAdmin
      .from("admin_users")
      .select("*")
      .eq("email", user.email)
      .single()

    if (adminError || !adminData) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    // If setting as primary, unset other primary images first
    if (updates.is_primary) {
      await supabaseAdmin
        .from("restaurant_images")
        .update({ is_primary: false })
        .eq("restaurant_id", id)
    }

    // Update the image
    const { data: image, error: updateError } = await supabaseAdmin
      .from("restaurant_images")
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq("id", imageId)
      .eq("restaurant_id", id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ error: "Failed to update image" }, { status: 500 })
    }

    return NextResponse.json({ image })
  } catch (error) {
    console.error("Error updating image:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const imageId = searchParams.get('imageId')

    if (!imageId) {
      return NextResponse.json({ error: "Image ID required" }, { status: 400 })
    }

    // Verify admin authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const supabaseAdmin = createAdminClient()
    
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // Verify user is admin
    const { data: adminData, error: adminError } = await supabaseAdmin
      .from("admin_users")
      .select("*")
      .eq("email", user.email)
      .single()

    if (adminError || !adminData) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    // Get image details before deletion
    const { data: image, error: fetchError } = await supabaseAdmin
      .from("restaurant_images")
      .select("blob_url")
      .eq("id", imageId)
      .eq("restaurant_id", id)
      .single()

    if (fetchError || !image) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 })
    }

    // Delete from database
    const { error: deleteError } = await supabaseAdmin
      .from("restaurant_images")
      .delete()
      .eq("id", imageId)
      .eq("restaurant_id", id)

    if (deleteError) {
      return NextResponse.json({ error: "Failed to delete image" }, { status: 500 })
    }

    // Delete from Vercel Blob
    try {
      await del(image.blob_url)
    } catch (blobError) {
      console.error("Failed to delete blob:", blobError)
      // Continue anyway - database deletion succeeded
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting image:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
