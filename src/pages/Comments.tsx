import { useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// icons
import { ArrowLeftOutlined } from '@mui/icons-material';

// types
import { CommentProps, PostProps } from '@typings/types';

// components
import { Alert, Box, Button, TextField } from '@mui/material';
import { Item } from '@src/components';

// context
import { queryClient, useApp } from '@src/ThemedApp';

// apis
import { deleteComment, deletePost, fetchPost, postComment } from '@src/libs/fetcher';

// react-query
import { useMutation, useQuery } from 'react-query';


const Comments = () => {

    const { id } = useParams();

    const contentInput = useRef<HTMLInputElement>()
    const navigate = useNavigate();

    const { setAlert } = useApp();

    const { data: post, isLoading, error, isError } = useQuery<PostProps, Error>(
        "comments", async () => fetchPost(Number(id))
    )

    const removePost = useMutation(
        async (id: number) => deletePost(id), {
        onSuccess: () => {
            navigate("/");
            setAlert({ alertMsg: "Post Deleted", alertType: "success" })
        }
    }
    );

    const onComment = (e: React.FormEvent) => {
        e.preventDefault();
        const content = contentInput.current && contentInput.current.value;

        if (!content) return false;

        addComment.mutate(content);
        (e.currentTarget as HTMLFormElement).reset();
    }

    const addComment = useMutation(async (content: string) => postComment({ content, postId: Number(id) }), {
        onSuccess: async (comment: CommentProps) => {
            await queryClient.cancelQueries("comments");
            await queryClient.setQueryData("comments", (old) => {
                old.comments = [...old.comments, comment];
                return { ...old };
            })
            setAlert({ alertMsg: "Comment added successfully!", alertType: "success" })
        }
    })

    const removeComment = useMutation(async (id: number) => deleteComment(id), {
        onMutate: async (id: number) => {
            await queryClient.cancelQueries("comments");
            await queryClient.setQueryData("comments", (old: PostProps | undefined) => {
                if (old) {
                    old.comments = old.comments?.filter((comment) => comment.id !== id);
                    return old;
                }
                return undefined;
            })
            setAlert({ alertMsg: "Comment Deleted", alertType: "success" })
        }
    })

    if (isError) {
        return <Box>
            <Alert severity='warning'> {error?.message} </Alert>
        </Box>
    }

    if (isLoading) {
        return <Box sx={{ textAlign: "center" }} >
            Loading . . .
        </Box>
    }


    return (
        <Box>
            <Button size='small' variant='text' onClick={() => navigate(-1)} sx={{ mb: 2 }} >
                <ArrowLeftOutlined /> Back
            </Button>
            <Item item={post!} onRemove={() => post?.id && removePost.mutate(post.id)} primary />
            {
                post?.comments?.map((comment: CommentProps) => <Item key={comment.id} item={comment} onRemove={() => removeComment.mutate(comment.id)} comment />)
            }
            <form onSubmit={onComment}>
                <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 3, }}>
                    <TextField inputRef={contentInput} multiline placeholder="Your Comment" />
                    <Button type="submit" variant="contained">Reply</Button>
                </Box>
            </form>
        </Box>
    )
}

export default Comments
