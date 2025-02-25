"use server";

import { prisma } from "@/lib/prisma";
import { getUserByEmail } from "@/utils/getUser";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

// To create a comment
export async function createComment(formData: FormData) {
    "use server";

    const session = await getServerSession();
    if (!session?.user) throw new Error("Unauthorized");

    const user = await getUserByEmail(session.user.email);
    if (!user) throw new Error("Current User not in database.");

    const newComment = formData.get("newComment")?.toString().trim();
    const pachikuId = formData.get("pachikuId")?.toString();
    // 🚨 thePachikuId comes from the from form a type="hidden" input

    if (!newComment || !pachikuId) return;

    try {
        await prisma.comment.create({
            data: {
                comment: newComment,
                userId: user.id,
                pachikuId,
            },
        });

        revalidatePath(`/pachiku-page/${pachikuId}`);
        revalidatePath("/");
    } catch (error) {
        console.error("Error posting new comment: ", error);
    }
}

// To delete a comment
export async function deleteComment(formData: FormData) {
    "use server";
    const session = await getServerSession();
    const commentId = formData.get("commentId")?.toString();
    const pachikuId = formData.get("pachikuId")?.toString();
    // 🚨 thePachikuId and commentId comes from the from form a type="hidden" input

    if (!session?.user || !(formData instanceof FormData))
        throw new Error("Unauthorized");

    // Fetching the original comment based off that id for authorization checking
    const theComment = await prisma.comment.findUnique({
        where: { id: commentId },
    });

    if (!theComment) throw new Error("comment id mismatch");

    // Finding the user stored in the comment DB
    const commenter = await prisma.user.findUnique({
        where: { id: theComment.userId },
    });

    if (!commenter)
        throw new Error("Could not find the commenter of the comment.");

    // Trying to match the current signed in user vs the commenter
    if (session.user.email !== commenter?.email)
        throw new Error("You are not authorized to delete this comment");

    try {
        await prisma.comment.delete({ where: { id: commentId } });
        revalidatePath(`/pachiku-page/${pachikuId}`);
    } catch (error) {
        console.error("Error deleting the comment: ", error);
    }
}
