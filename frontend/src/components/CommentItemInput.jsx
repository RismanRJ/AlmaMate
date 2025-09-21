import {
  FormControl,
  InputGroup,
  Input,
  InputRightElement,
  IconButton,
  FormErrorMessage,
} from "@chakra-ui/react";
import { useState } from "react";

import { BiSend } from "react-icons/bi";
import { axiosInstance } from "../lib/axios";

const CommentItemInput = ({ setShowComments, setPosts, post }) => {
  const [newComment, setNewComment] = useState("");
  const [commentError, setCommentError] = useState("");
  const handleAddComment = async (postId) => {
    if (!newComment.trim()) {
      setCommentError("Comment cannot be empty");
      return;
    }
    console.log("comment", newComment);

    setCommentError("");
    try {
      const res = await axiosInstance.post(`/posts/${postId}/comment`, {
        comment: newComment,
      });
      console.log(res.data);

      const { post } = res.data;
      setPosts((prevPosts) =>
        prevPosts.map((p) => (p._id === post._id ? post : p))
      );

      setNewComment("");
      // Ensure comments are shown after adding one
      setShowComments((prev) => ({
        ...prev,
        [postId]: true,
      }));
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };
  return (
    <FormControl isInvalid={!!commentError}>
      <InputGroup size="md">
        <Input
          // ref={commentInputRef}
          placeholder="Write a comment..."
          value={newComment}
          onChange={(e) => {
            setNewComment(e.target.value);
            if (commentError) setCommentError("");
          }}
          pr="2.5rem"
        />
        <InputRightElement width="2.5rem">
          <IconButton
            h="1.75rem"
            size="sm"
            icon={<BiSend />}
            colorScheme="blue"
            onClick={() => handleAddComment(post._id)}
          />
        </InputRightElement>
      </InputGroup>
      {commentError && <FormErrorMessage>{commentError}</FormErrorMessage>}
    </FormControl>
  );
};

export default CommentItemInput;
