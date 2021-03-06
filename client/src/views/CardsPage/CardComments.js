import React, { useState, useEffect, useContext } from 'react';
import { Comment, Avatar, Input, Form, Button, Divider } from 'antd';
import { UserContext } from '../../Context'
const CardComments = ({ children, user, card, game }) => {
    console.log(` Comment Params ${user} ${card} ${game}`)
    const { fetchWithCSRF, userInfo } = useContext(UserContext);
    const [commentsPageState, setCommentsPageState] = useState({ comments: [] })
    const [commentMessage, setCommentMessage] = useState('')
    useEffect(() => {
        async function fetchComments() {
            const res = await fetch(`/api/card-comments/${user.username}/${game.name}/${card.name}`, {
                method: 'GET',
                credentials: 'include'
            })
            if (res) {
                const { card, user, game, comments } = await res.json()
                await setCommentsPageState({ ...commentsPageState, card, user, game, comments })
            } else {
                await setCommentsPageState({ ...commentsPageState })
            }
        }
        fetchComments();
    }, []);
    const onCommentChange = (e) => {
        setCommentMessage(e.target.value)
    }
    const onCommentSubmit = async (e) => {
        console.log(commentMessage);
        console.log(`${user.username}/${game.name}/${card.name}`)
        const res = await fetchWithCSRF(`/api/card-comments/${user.username}/${game.name}/${card.name}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: 'include',
            body: JSON.stringify({ message: commentMessage, user_id: userInfo.id })
        })
        console.log(res)
        if (res.ok) {
            const { comment } = await res.json();
            let copiedComments = { ...commentsPageState }
            copiedComments.comments.push(comment)
            await setCommentsPageState(copiedComments);
            setCommentMessage('')
            return comment;
        }
    };


    const onDeleteComment = async (e) => {
        const splitId = e.target.id.split('_')
        console.log(splitId)
        const commentID = splitId[0].split('card-comment-')[1]
        const commentIndex = splitId[1].split('index-')[1]

        console.log(commentID)
        console.log(commentIndex)
        console.log(`${user.username}/${game.name}/${card.name}`)
        const res = await fetchWithCSRF(`/api/card-comments/${commentID}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: 'include'
        })
        console.log(res)
        if (res.ok) {
            const data = await res.json();
            let copiedComments = [...commentsPageState.comments]
            copiedComments.splice(commentIndex, 1);
            await setCommentsPageState({ ...commentsPageState, comments: copiedComments });
            setCommentMessage('')
            return data;
        }
    }
    return (<>
        {commentsPageState.comments.length > 0 ?
            commentsPageState.comments.map((ele, index) => {
                return (
                    <>
                        <Divider />
                        <Comment
                            // actions={[<span key="comment-nested-reply-to">Reply to</span>]}
                            key={index}
                            author={ele.User && <a href={`/${ele.User.username}`}>{ele.User.username}</a>}
                            avatar={
                                <Avatar
                                    src={ele.User && ele.User.profile_pic_src}
                                    alt={ele.User && ele.User.username}
                                />
                            }
                            style={{ padding: '2em', backgroundColor: 'white' }}
                            content={<>
                                <p style={{ padding: '2em' }}>
                                    {ele.message}
                                </p>
                                <button primary size='small' id={`card-comment-${ele.id}_index-${index}`} onClick={onDeleteComment}>Delete</button>
                            </>

                            }
                        >
                            {children}
                        </Comment>
                        <Divider />
                    </>
                )
            })
            : <p>NO STUFF</p>
        }
        <Form.Item>
            <Input.TextArea rows={4} onChange={onCommentChange} value={commentMessage} />
        </Form.Item>
        <Form.Item>
            <Button htmlType="submit" onClick={onCommentSubmit} disabled={!userInfo.id} type="primary">
                Add Comment
      </Button>
        </Form.Item>
    </>
    );
}
export default CardComments;
