const fetchQuestion = {};
const redisHandler = require('../socket/redisHandler.js');
const logger = require('../utils/winston');
const appConstants = require("../config/appConstants.json");
const _ = require('lodash');

/**
 * @Description method to get image by image id
 * @param  {Number} childTagId id of child tag
 * @param {Number} difficultyLevelId id of difficulty level
 * @param {Number} count numbers of questions
 * @param {Array} skip existing questions
 * @return {Array} images id list
 */

 fetchQuestion.getImagesIds = async (childTagId, count, skip) => {
    try {
        let pushedCount = 0;
        let imageIds = []
        let images = await redisHandler.getData(`game_tag_images_${childTagId}`);
        images = JSON.parse(images);
        images = _.sampleSize(images, images.length);
        if(images && images.length) {
            for(let i=0; i<images.length ; i++) {
                if(!(skip.includes(images[i]))) {
                    imageIds.push(images[i])
                    pushedCount++;
                }
                if(pushedCount >= count) {
                    return imageIds;
                }
            }
        } else {
            logger.info("No data found against", `game_tag_images_${childTagId}`);
        }
        return imageIds;
    } catch(err) {
        logger.error(`Error while fetching images's ids list`, err);
        return [];
    }
}


/**
 * @Description method to get question ids by chidTag and difficulty level
 * @AdditionalInfo (3, 2 and 1 are the consecutive difficulty ids of easy, medium and hard)
 * @param  {Number} childTagId id of child tag
 * @param {Number} difficultyLevelId id of difficulty level
 * @param {Number} count numbers of questions
 * @param {Array} skip existing questions
 * @return {Array} question id list
 */
 fetchQuestion.getQuestionIds = async (childTagId, difficultyLevelId, count, skip) => {
    try {
        let pushedCount = 0;
        let qIds = []
        let questions = await redisHandler.getData(`game_tag_questions_${childTagId}_${difficultyLevelId}`);
        question = JSON.parse(questions);
        if(question && question.length) {
            question = _.sampleSize(question, question.length);
            for(let i=0; i<questions.length ; i++) {
                if(question[i] && !(skip.includes(question[i]))) {
                    qIds.push(question[i])
                    pushedCount++;
                }
                if(pushedCount >= count) {
                    return qIds;
                }
            }
            return qIds;
        } else {
            logger.info(`No data found against game_tag_questions_${childTagId}_${difficultyLevelId}`)
            return qIds;
        }
        
    } catch(err) {
        logger.error(`Error while fetching question's ids list`, err);
        return [];
    }
}


/**
 * @Description load initial questions(10 easy, 10 medium and 20 hard)
 * @AdditionalInfo (3, 2 and 1 are the consecutive difficulty ids of easy, medium and hard)
 * @params {String} parentTagId 
 * @params {Array} existingQuestions
 * @return {Array} Array of question ids
 */
fetchQuestion.setInitialQuestions = async (parentTagId, existingQuestions = [], existingImages = []) => {
    try {
        let childTags = await redisHandler.getData(`game_parent_child_tag_group_${parentTagId}`);
        childTags = JSON.parse(childTags);
        if(childTags && childTags.length) {
            childTags = _.sampleSize(childTags, childTags.length);
        }
        const easyFromEachTag = Math.ceil(appConstants.EASY_QUESTION_COUNT / childTags.length);
        const mediumFromEachTag = Math.ceil(appConstants.MEDIUM_QUESTION_COUNT / childTags.length);
        const hardFromEachTag = Math.ceil(appConstants.HARD_QUESTION_COUNT / childTags.length);
        let easyQuestions = [];
        let mediumQuestions = [];
        let hardQuestions = [];

        let easyQuestionsTamp = [];
        let mediumQuestionsTamp = [];
        let hardQuestionsTamp = [];

        let images = [];
        for(let i = 0 ; i<childTags.length ; i++) {
            easyQuestionsTamp = [];
            mediumQuestionsTamp = [];
            hardQuestionsTamp = [];
            images = [];

            easyQuestionsTamp = await fetchQuestion.getQuestionIds(childTags[i], 3, easyFromEachTag, existingQuestions);
            mediumQuestionsTamp = await fetchQuestion.getQuestionIds(childTags[i], 2, mediumFromEachTag, existingQuestions);
            hardQuestionsTamp = await fetchQuestion.getQuestionIds(childTags[i], 1, hardFromEachTag, existingQuestions);

            images = await fetchQuestion.getImagesIds(childTags[i], easyFromEachTag + mediumFromEachTag + hardFromEachTag, existingImages);
            easyQuestions = easyQuestions.concat(easyQuestionsTamp.map((item, index)=>{return {id: item, image: images[index]} }));
            mediumQuestions = mediumQuestions.concat(mediumQuestionsTamp.map((item, index)=>{return {id: item, image: images[index + easyQuestionsTamp.length]} }));
            hardQuestions = hardQuestions.concat(hardQuestionsTamp.map((item, index)=>{return {id: item, image: images[index + easyQuestionsTamp.length + mediumQuestionsTamp.length]} }));
        }

        //sometimes question count may be grater then required, because of this we are slicing 
        easyQuestions = easyQuestions.slice(0, appConstants.EASY_QUESTION_COUNT);
        mediumQuestions = mediumQuestions.slice(0, appConstants.MEDIUM_QUESTION_COUNT);
        hardQuestions = hardQuestions.slice(0, appConstants.HARD_QUESTION_COUNT);
        return  (easyQuestions.concat(mediumQuestions).concat(hardQuestions));
    } catch(err) {
        logger.error('Error while setting initial questions: ', err);
    }
};


/**
 * @Description get next 40 hard questions
 * @AdditionalInfo (3, 2 and 1 are the consecutive difficulty ids of easy, medium and hard)
 * @params {Number} parentTagId 
 * @params {Array} existingQuestions
 * @return {Array} Array of question ids
 */
fetchQuestion.reloadHardQuestions = async (parentTagId, existingQuestions, existingImages) => {
    try {
        let childTags = await redisHandler.getData(`game_parent_child_tag_group_${parentTagId}`);
        childTags = JSON.parse(childTags);
        if(childTags && childTags.length) {
            childTags = _.sampleSize(childTags, childTags.length);
        }
        const hardFromEachTag = Math.ceil(appConstants.HARD_QUESTION_COUNT / childTags.length);
        let hardQuestions = [];
        let images = [];
        let hardQuestionsTamp = [];
  
        for(let i = 0 ; i < childTags.length ; i++) {
            hardQuestionsTamp = await fetchQuestion.getQuestionIds(childTags[i], 1, hardFromEachTag, existingQuestions);
            images = await fetchQuestion.getImagesIds(childTags[i], hardFromEachTag, existingImages);
            hardQuestionsTamp = hardQuestionsTamp.map((item, index)=>{return {id: item, image: images[index]} });
            hardQuestions = hardQuestions.concat(hardQuestionsTamp);
        }
        //sometimes question count may be grater then required, because of this we are slicing 
        hardQuestions = hardQuestions.slice(0, appConstants.HARD_QUESTION_COUNT);
        return hardQuestions;
    } catch(err) {
        logger.error('Error while reloading questions: ', err);
        return [];
    }
};


/**
 * @Description map id and questions
 * @params {Array} questionIds
 * @return {Array} of question ids // { id: 1, question: "The is question", image: }
 */
 fetchQuestion.mapQuestionWithIds = async (questionIds = []) => {
    try {
        let questions = [];
        for(let i = 0 ; i<questionIds.length ; i++) {
            question = await redisHandler.getData(`game_question_${questionIds[i].id}`);
            if(question) {
                questions.push({id: questionIds[i].id, image: questionIds[i].image, question,  })
            } else {
                logger.error(`Question not found against 'game_question_${questionIds[i].id}'`, {});
            }
        }
        return questions;
    } catch(err) {
        logger.error('While fetching questions: ', err);
        return [];
    }
};

module.exports = fetchQuestion;