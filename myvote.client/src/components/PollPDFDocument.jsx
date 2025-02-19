import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontFamily: 'Helvetica',
    },
    card: {
        marginBottom: 20,
        padding: 10,
        border: '1px solid #000',
        borderRadius: 5,
        backgroundColor: '#f0f0f0',
    },
    title: {
        fontSize: 24,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    description: {
        fontSize: 14,
        textAlign: 'center',
    },
    graphContainer: {
        marginBottom: 20,
        padding: 10,
        border: '1px solid #000',
        borderRadius: 5,
        backgroundColor: '#f0f0f0',
    },
    choicesContainer: {
        marginBottom: 20,
        padding: 10,
        border: '1px solid #000',
        borderRadius: 5,
        backgroundColor: '#f0f0f0',
    },
    choice: {
        fontSize: 12,
        marginBottom: 5,
    },
});

const PollPDFDocument = ({ poll, graphImage }) => (
    <Document>
        <Page style={styles.page}>
            <View style={styles.card}>
                <Text style={styles.title}>{poll.title}</Text>
            </View>
            <View style={styles.card}>
                <Text style={styles.description}>{poll.description}</Text>
            </View>
            <View style={styles.graphContainer}>
                {graphImage ? (
                    <Image src={graphImage} />
                ) : (
                    <Text>Loading graph...</Text>
                )}
            </View>
            <View style={styles.choicesContainer}>
                {poll.choices.map((choice, index) => {
                    const totalVotes = poll.choices.reduce((sum, c) => sum + c.numVotes, 0);
                    const percentage = totalVotes > 0 ? ((choice.numVotes / totalVotes) * 100).toFixed(1) : 0;
                    return (
                        <Text key={choice.choiceId} style={styles.choice}>
                            {index + 1}. {choice.name} - {percentage}% ({choice.numVotes} votes)
                        </Text>
                    );
                })}
            </View>
        </Page>
    </Document>
);

export default PollPDFDocument;
