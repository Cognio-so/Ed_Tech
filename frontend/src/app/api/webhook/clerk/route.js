import { Webhook } from 'svix'
import { headers } from 'next/headers'
import connectDB from '@/lib/db'
import User from '@/models/userModel'
import { clerkClient } from '@clerk/nextjs/server'

export async function POST(req) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    console.error('CLERK_WEBHOOK_SECRET is not set')
    return new Response('Webhook secret not configured', { status: 500 })
  }

  const headerPayload = headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occurred -- no svix headers', { status: 400 })
  }

  const payload = await req.json()
  const body = JSON.stringify(payload)

  const wh = new Webhook(WEBHOOK_SECRET)
  let evt

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    })
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error occurred', { status: 400 })
  }

  const eventType = evt.type
  console.log(`Received webhook event: ${eventType}`)

  try {
    await connectDB()

    if (eventType === 'user.created') {
        const { id, email_addresses, first_name, last_name } = evt.data;
        const primaryEmail = email_addresses.find(e => e.id === evt.data.primary_email_address_id)?.email_address;
        
        await User.create({
            clerkId: id,
            name: `${first_name || ''} ${last_name || ''}`.trim(),
            email: primaryEmail,
            role: 'student'
        });

        await clerkClient.users.updateUserMetadata(id, {
            publicMetadata: {
                role: 'student'
            }
        });

    } else if (eventType === 'user.updated') {
        const { id, first_name, last_name } = evt.data;
        await User.findOneAndUpdate({ clerkId: id }, {
            name: `${first_name || ''} ${last_name || ''}`.trim(),
        }, { new: true });

    } else if (eventType === 'user.deleted') {
        const { id } = evt.data;
        await User.findOneAndDelete({ clerkId: id });
    }

    return new Response('Webhook processed successfully', { status: 200 });

  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response('Error occurred during webhook processing', { status: 500 });
  }
}

// Handle other HTTP methods
export async function GET() {
  return new Response('Webhook endpoint is working', { status: 200 })
}

export async function OPTIONS() {
  return new Response(null, { status: 200 })
} 