import { Webhook } from "svix"
import { headers } from "next/headers"
import type { WebhookEvent } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { db as prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  // Get the headers
  const headerPayload = headers()
  const svix_id = (await headerPayload).get("svix-id")
  const svix_timestamp = (await headerPayload).get("svix-timestamp")
  const svix_signature = (await headerPayload).get("svix-signature")

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error: Missing svix headers", {
      status: 400,
    })
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload)

  // Create a new Svix instance with your webhook secret
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET

  // If there's no webhook secret, error out
  if (!webhookSecret) {
    console.error("Error: Missing CLERK_WEBHOOK_SECRET")
    return new Response("Error: Missing webhook secret", {
      status: 500,
    })
  }

  // Create a new Svix instance with your webhook secret
  const wh = new Webhook(webhookSecret)

  let evt: WebhookEvent

  // Verify the webhook payload
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error("Error verifying webhook:", err)
    return new Response("Error verifying webhook", {
      status: 400,
    })
  }

  // Get the event type
  const eventType = evt.type

  // Handle the event
  try {
    switch (eventType) {
      case "user.created": {
        const { id, email_addresses, first_name, last_name, image_url } = evt.data

        // Get the primary email
        const primaryEmail = email_addresses.find((email: any) => email.id === evt.data.primary_email_address_id)

        // Create the user in our database
        await prisma.user.create({
          data: {
            clerkId: id,
            email: primaryEmail?.email_address || "",
            name: [first_name, last_name].filter(Boolean).join(" "),
            imageUrl: image_url,
          },
        })

        break
      }

      case "user.updated": {
        const { id, email_addresses, first_name, last_name, image_url } = evt.data

        // Get the primary email
        const primaryEmail = email_addresses.find((email: any) => email.id === evt.data.primary_email_address_id)

        // Update the user in our database
        await prisma.user.update({
          where: {
            clerkId: id,
          },
          data: {
            email: primaryEmail?.email_address || "",
            name: [first_name, last_name].filter(Boolean).join(" "),
            imageUrl: image_url,
          },
        })

        break
      }

      case "user.deleted": {
        const { id } = evt.data

        // Delete the user from our database
        await prisma.user.delete({
          where: {
            clerkId: id,
          },
        })

        break
      }

      default:
        console.log(`Unhandled event type: ${eventType}`)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error handling webhook:", error)
    return NextResponse.json({ success: false, error: "Failed to process webhook" }, { status: 500 })
  }
}
