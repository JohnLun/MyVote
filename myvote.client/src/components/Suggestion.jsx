import { FaCheck } from "react-icons/fa";
import { FaTimes } from "react-icons/fa";

function Suggestion({suggestion}) {
    return(
        <>
            <div className="card mb-3">
                <div className="card-body d-flex justify-content-between align-items-center">
                    <div>
                        <h5 className="card-title">
                            Suggestion for {suggestion.pollName}
                        </h5>
                        <p className="card-text">
                            Suggestion: {suggestion.suggestionName}
                        </p>
                    </div>
                    <div>
                        <button className="deny-icon">
                            <FaTimes/>
                        </button>
                        <button className="accept-icon">
                            <FaCheck/>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Suggestion;