import { Box, Container } from "@mui/material";
import React, { useState } from "react";
import { useApp } from "./ThemedApp";
import { Form, Header, Item } from "./components";


const App = () => {

    const { showForm } = useApp();

    const [data, setData] = useState([
        { id: 1, content: "Hello, World!", name: "Alice" },
        { id: 2, content: "React is fun.", name: "Chris" },
        { id: 3, content: "Yay, interesting.", name: "Evan" },
    ])

    const addItem = ({ content, name }: { content: string, name: string }) => {
        const id = data[data.length - 1].id + 1;
        setData([...data, { id, content, name }])
    }

    const removeItem = (id: number) => {
        setData(data.filter(item => item.id !== id))
    }

    return (
        <Box>
            <Header />
            <Container maxWidth="sm" sx={{ mt: 4 }}>
                {
                    showForm && <Form add={addItem} />
                }
                {
                    data.map(item => <Item key={item.id} item={item} onRemove={removeItem} />)
                }
            </Container>
        </Box>
    )
}


export default App
