import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

const WordCloud = ({ opinions }) => {
    const svgRef = useRef(null);
    const [dimensions, setDimensions] = useState({
        width: window.innerWidth * 0.7, // 80svw
        height: window.innerHeight * 0.3, // 80svh
    });

    useEffect(() => {
        const handleResize = () => {
            setDimensions({
                width: window.innerWidth * 0.7,
                height: window.innerHeight * 0.3,
            });
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        if (!opinions || opinions.length === 0) return;

        const { width, height } = dimensions;

        const svg = d3.select(svgRef.current)
            .attr("width", width)
            .attr("height", height)
            .style("background", "transparent");

        svg.selectAll("*").remove();

        const wordArray = opinions.map((opinion, index) => ({
            text: opinion,
            size: Math.min(40, 12 + Math.random() * 20), // Randomized size for variety
            id: index
        }));

        const colors = d3.scaleOrdinal(d3.schemeCategory10);

        const wordElements = svg
            .selectAll("text")
            .data(wordArray)
            .enter()
            .append("text")
            .style("fill", (d, i) => colors(i))
            .style("font-size", d => `${d.size}px`)
            .style("cursor", "pointer")
            .attr("text-anchor", "middle")
            .text(d => d.text)
            .on("mouseover", function () {
                d3.select(this).transition().duration(300).style("fill", "red");
            })
            .on("mouseout", function () {
                d3.select(this).transition().duration(300).style("fill", (d, i) => colors(i));
            });

        // Position opinions randomly
        wordElements
            .attr("x", d => Math.random() * (width - d.size * 2) + d.size)
            .attr("y", d => Math.random() * (height - d.size * 2) + d.size)
            .transition()
            .duration(1000)
            
            .attr("x", d => Math.random() * (width - d.size) + d.size / 2)  // Ensures words stay within left & right bounds
            .attr("y", d => Math.random() * (height - d.size) + d.size / 2); // Ensures words stay within top & bottom bounds

    }, [opinions, dimensions]);

    return (
        <svg ref={svgRef} style={{ maxWidth: "100%", width: "70svw", Eheight: "30svh", fontWeight: "bold", pointerEvents:"none" }} />
    );
    
};

export default WordCloud;
