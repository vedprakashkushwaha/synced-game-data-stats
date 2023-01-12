const express = require('express');
const redisHandler = require('./config/redis');
const app = express();
const port = 3333;

app.get('/', (req, res) => {
    res.send('Hello World!')
}
);

// app.get('/set', async (req, res) => {
//     await redisHandler.setData('test', 'test');
//     res.send('Data set');
// }
// );

app.get('/get-tag-wise-images-ques', async (req, res) => {
    const tags = ['game_parent_child_tag_group_1','game_parent_child_tag_group_2','game_parent_child_tag_group_3','game_parent_child_tag_group_4','game_parent_child_tag_group_5'];
    childArray = [];
    for(let i=0; i<tags.length; i++) {
        let data = await redisHandler.getData(tags[i]);
        data = JSON.parse(data);
        childArray = [...childArray, ...data]
    }
    const childWihData = {};
    for(let i=0; i<childArray.length; i++) {
        let images = await redisHandler.getData(`game_tag_images_${childArray[i]}`);
        images = JSON.parse(images);

        quesLevels = [1,2,3];

        qCount = 0;
        for(let j=0; j<quesLevels.length; j++) {
            let questions = await redisHandler.getData(`game_tag_questions_${childArray[i]}_${quesLevels[j]}`);
            questions = JSON.parse(questions);
            qCount += questions?.length || 0;
        }
        childWihData[childArray[i].toString()] = {
            images: images?.length || 0,
            questions: qCount
        }
    }

    res.send({data: childWihData});
}
);

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
}
);
