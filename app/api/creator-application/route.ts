import { auth } from "@clerk/nextjs"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }
    
    const formData = await req.json()
    
    // Store application in database
    const creatorApplication = await db.creatorApplication.create({
      data: {
        userId,
        status: "pending",
        isOver18: formData.isOver18,
        agreesToTerms: formData.agreesToTerms,
        dateSubmitted: new Date(),
        
        // Create related records with one-to-one relationships
        identity: {
          create: {
            fullName: formData.fullName,
            dateOfBirth: new Date(formData.dateOfBirth),
            countryOfResidence: formData.countryOfResidence,
            governmentIdFrontUrl: "url-placeholder", // Replace with actual storage URLs
            governmentIdBackUrl: "url-placeholder",
            selfieUrl: "url-placeholder",
          }
        },
        taxInfo: {
          create: {
            isUSCitizen: formData.isUSCitizen === "yes",
            taxCountry: formData.taxCountry,
            taxId: formData.taxId, // In production, encrypt sensitive data
            businessName: formData.businessName || null,
            taxAddress: formData.taxAddress,
            taxClassification: formData.taxClassification,
          }
        },
        paymentInfo: {
          create: {
            stripeConnectId: "placeholder-id", // Replace with actual Stripe Connect ID
            payoutCurrency: formData.payoutCurrency,
            payoutSchedule: formData.payoutSchedule,
          }
        },
        creatorProfile: {
          create: {
            displayName: formData.displayName,
            profilePhotoUrl: "url-placeholder", // Replace with actual storage URL
            bio: formData.bio,
            contentCategories: formData.contentCategories,
          }
        },
        agreement: {
          create: {
            agreesToAllDocs: formData.agreesToAllDocs,
            signature: formData.signature,
            signatureDate: new Date(),
          }
        }
      }
    })
    
    return NextResponse.json({ success: true, id: creatorApplication.id })
  } catch (error) {
    console.error("Error creating creator application:", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 