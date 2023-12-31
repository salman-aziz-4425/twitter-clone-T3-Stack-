"use client"

import { type FC, useState, useEffect, useRef } from "react";
import Image from "next/image";

import { api } from "~/utils/trpc";
import { useSession } from "next-auth/react";

const NewTweetForm: FC = () => {
  const [content, setContent] = useState<string>("");
  const textAreaRef = useRef<HTMLTextAreaElement>(null); 

  const sessionData=useSession()
  const utils=api.useUtils()

  useEffect(()=>{
    updateTextAreaSize()
  },[content])

  const createTweet = api.tweet.create.useMutation({
    onSuccess: (newData) => {

      utils.tweet.getTweet.setInfiniteData({},(oldData)=>{
        if (oldData?.pages[0] == null) return;
        
        return {
          ...oldData,
          pages:[
           {
            ...oldData?.pages[0],
            data:[newData,...oldData?.pages[0]?.data]
           },
           ...oldData.pages.slice(1)
          ]
        }
      })
      alert("Tweet created")
      console.log("Tweet created");
    },
  });

  const updateTextAreaSize = () => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "0";
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
    }
  };

  return (
    <div className="py-4 border-b px-4 w-full">
      <div className="pt-4 flex items-center gap-4">
        {sessionData.status === "authenticated" && (
          <div className="h-full w-full">
            <div>
              <form className="flex  px-4">
              <div className="h-12 relative  w-12   left-0">
                <Image
                  className="rounded-full top-2 absolute"
                  src={String(sessionData.data?.user.image)}
                  height={100}
                  width={100}
                  alt="User Avatar"
                />
              </div> 
              <textarea
                  ref={textAreaRef}
                  style={{ minHeight: '2rem' }}
                  onChange={(e) => setContent(String(e.target.value))}
                  placeholder="What's happening?"
                  className="flex-grow h-full w-full p-4 outline-none overflow-hidden text-lg min-h-40"
                />
              </form>
            
            </div>
          
          </div>
        )}
          <button
                className="px-4 self-end py-2 bg-black text-white rounded-md"
                onClick={() =>
                  createTweet.mutate({
                    userId:String(sessionData.data?.user.id),
                    content: String(content),
                  })
                }
              >
                Post
              </button>
      </div>
    </div>
  );
};

export default NewTweetForm;
