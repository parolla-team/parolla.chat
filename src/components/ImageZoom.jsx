/**
 * Component used in the blog post with MDX to zoom on the image
 */
import React from "react"

const Image = (props) => {
    const [click, setClick] = React.useState(false)

    const setFlag = () => {
        
        setClick(true)
    }

    const unsetFlag = () => {
        setClick(false)
    }

    return (
        <>
            {click ? (
                <div onClick={unsetFlag} className="fixed z-[999] w-screen h-screen flex items-center items-center transition-opacity duration-[ease] delay-[0.4s] left-0 top-0 visible opacity-100 bg-black">
                    <img {...props} className="w-screen h-screen object-contain"></img>
                </div>
            ) : (
                <img {...props} onClick={setFlag}></img>
            )}
        </>
    )

}
export default Image