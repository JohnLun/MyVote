import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

// PDF Styles
const styles = StyleSheet.create({
    page: {
        padding: 20,
        backgroundColor: '#f8f9fa',
        fontFamily: 'Helvetica',
    },
    title: {
        fontSize: 22,
        textAlign: 'center',
        marginBottom: 10,
        fontWeight: 'bold',
        color: '#333',
    },
    section: {
        marginBottom: 15,
        padding: 10,
        borderRadius: 8,
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    text: {
        fontSize: 12,
        color: '#555',
        marginBottom: 5,
    },
    choiceContainer: {
        marginTop: 10,
        padding: 8,
        backgroundColor: '#e9ecef',
        borderRadius: 5,
    },
    choiceText: {
        fontSize: 12,
    },
    image: {
        marginTop: 10,
        borderRadius: 5,
    },
});

// PDF Component
const PollPDF = ({ poll, graphImage }) => {
    const maxHeight = 200;

    let computedWidth = "auto";
    let computedHeight = "auto";

    if (graphImage && graphImage.width && graphImage.height) {
        const aspectRatio = graphImage.width / graphImage.height;

        if (graphImage.height > maxHeight) {
            computedHeight = maxHeight;
            computedWidth = maxHeight * aspectRatio;
        } else {
            computedWidth = graphImage.width;
            computedHeight = graphImage.height;
        }
    }

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.section}>
                    <Text style={styles.title}>{poll.title}</Text>
                    <Text style={styles.text}>Description: {poll.description}</Text>
                    <Text style={styles.text}>Created: {new Date(poll.dateCreated).toLocaleString()}</Text>
                    <Text style={styles.text}>Expired: {new Date(poll.dateEnded).toLocaleString()}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 5 }}>Poll Results</Text>
                    {graphImage && (
                        <Image
                            src={graphImage.src}
                            style={{
                                height: computedHeight,
                                width: computedWidth,
                                borderRadius: 5,
                                alignSelf: 'center'
                            }}
                        />
                    )}
                </View>

                <View style={styles.section}>
                    <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 5 }}>Choices</Text>
                    {poll.choices.map((choice, index) => {
                        const totalVotes = poll.choices.reduce((sum, c) => sum + c.numVotes, 0);
                        const percentage = totalVotes > 0 ? ((choice.numVotes / totalVotes) * 100).toFixed(1) : 0;
                        return (
                            <View key={index} style={styles.choiceContainer}>
                                <Text style={styles.choiceText}>
                                    {index + 1}. {choice.name} - {percentage}% ({choice.numVotes} votes)
                                </Text>
                            </View>
                        );
                    })}
                </View>
            </Page>
        </Document>
    );
};


export default PollPDF;
