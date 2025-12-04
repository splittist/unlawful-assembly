import { describe, test, expect, beforeEach } from 'vitest';
import { SurveyCreatorService } from '@/services/surveyCreator';
import type { SurveyDefinition } from '@/types';

describe('SurveyCreatorService', () => {
  let surveyCreatorService: SurveyCreatorService;

  beforeEach(() => {
    surveyCreatorService = new SurveyCreatorService();
  });

  describe('moveQuestion', () => {
    beforeEach(() => {
      // Create a survey with multiple questions
      const survey: SurveyDefinition = {
        title: 'Test Survey',
        pages: [
          {
            name: 'page1',
            elements: [
              { type: 'text', name: 'question1', title: 'Question 1' },
              { type: 'text', name: 'question2', title: 'Question 2' },
              { type: 'text', name: 'question3', title: 'Question 3' }
            ]
          }
        ]
      };
      surveyCreatorService.loadSurvey(survey);
    });

    test('should move question up', () => {
      // Move question2 (index 1) up
      surveyCreatorService.moveQuestion(1, 'up');

      const result = surveyCreatorService.getSurveyJson();
      const elements = result.pages![0].elements;

      expect(elements[0].name).toBe('question2');
      expect(elements[1].name).toBe('question1');
      expect(elements[2].name).toBe('question3');
    });

    test('should move question down', () => {
      // Move question1 (index 0) down
      surveyCreatorService.moveQuestion(0, 'down');

      const result = surveyCreatorService.getSurveyJson();
      const elements = result.pages![0].elements;

      expect(elements[0].name).toBe('question2');
      expect(elements[1].name).toBe('question1');
      expect(elements[2].name).toBe('question3');
    });

    test('should throw error when moving first question up', () => {
      expect(() => {
        surveyCreatorService.moveQuestion(0, 'up');
      }).toThrow('Cannot move question in that direction');
    });

    test('should throw error when moving last question down', () => {
      expect(() => {
        surveyCreatorService.moveQuestion(2, 'down');
      }).toThrow('Cannot move question in that direction');
    });

    test('should throw error when page has no elements', () => {
      const emptySurvey: SurveyDefinition = {
        title: 'Empty Survey',
        pages: [{ name: 'page1', elements: [] }]
      };
      surveyCreatorService.loadSurvey(emptySurvey);

      // With an empty elements array, index 0 is out of bounds
      expect(() => {
        surveyCreatorService.moveQuestion(0, 'up');
      }).toThrow('Cannot move question in that direction');
    });

    test('should preserve question properties after move', () => {
      const surveyWithChoices: SurveyDefinition = {
        title: 'Test Survey',
        pages: [
          {
            name: 'page1',
            elements: [
              { type: 'text', name: 'question1', title: 'Question 1' },
              {
                type: 'radiogroup',
                name: 'question2',
                title: 'Question 2',
                choices: ['Option A', 'Option B'],
                isRequired: true
              }
            ]
          }
        ]
      };
      surveyCreatorService.loadSurvey(surveyWithChoices);

      surveyCreatorService.moveQuestion(1, 'up');

      const result = surveyCreatorService.getSurveyJson();
      const movedQuestion = result.pages![0].elements[0];

      expect(movedQuestion.name).toBe('question2');
      expect(movedQuestion.type).toBe('radiogroup');
      expect(movedQuestion.choices).toEqual(['Option A', 'Option B']);
      expect(movedQuestion.isRequired).toBe(true);
    });
  });

  describe('movePage', () => {
    beforeEach(() => {
      // Create a survey with multiple pages
      const survey: SurveyDefinition = {
        title: 'Test Survey',
        pages: [
          { name: 'page1', title: 'Page 1', elements: [] },
          { name: 'page2', title: 'Page 2', elements: [] },
          { name: 'page3', title: 'Page 3', elements: [] }
        ]
      };
      surveyCreatorService.loadSurvey(survey);
    });

    test('should move page up', () => {
      // Move page2 (index 1) up
      surveyCreatorService.movePage(1, 'up');

      const result = surveyCreatorService.getSurveyJson();
      const pages = result.pages!;

      expect(pages[0].name).toBe('page2');
      expect(pages[1].name).toBe('page1');
      expect(pages[2].name).toBe('page3');
    });

    test('should move page down', () => {
      // Move page1 (index 0) down
      surveyCreatorService.movePage(0, 'down');

      const result = surveyCreatorService.getSurveyJson();
      const pages = result.pages!;

      expect(pages[0].name).toBe('page2');
      expect(pages[1].name).toBe('page1');
      expect(pages[2].name).toBe('page3');
    });

    test('should throw error when moving first page up', () => {
      expect(() => {
        surveyCreatorService.movePage(0, 'up');
      }).toThrow('Cannot move page in that direction');
    });

    test('should throw error when moving last page down', () => {
      expect(() => {
        surveyCreatorService.movePage(2, 'down');
      }).toThrow('Cannot move page in that direction');
    });

    test('should throw error when survey has no pages', () => {
      const emptySurvey: SurveyDefinition = {
        title: 'Empty Survey',
        pages: []
      };
      surveyCreatorService.loadSurvey(emptySurvey);

      expect(() => {
        surveyCreatorService.movePage(0, 'up');
      }).toThrow('Cannot move page in that direction');
    });

    test('should preserve page properties after move', () => {
      const surveyWithElements: SurveyDefinition = {
        title: 'Test Survey',
        pages: [
          { name: 'page1', title: 'Page 1', elements: [] },
          {
            name: 'page2',
            title: 'Page 2 with questions',
            description: 'This page has questions',
            elements: [
              { type: 'text', name: 'q1', title: 'Question 1' }
            ]
          }
        ]
      };
      surveyCreatorService.loadSurvey(surveyWithElements);

      surveyCreatorService.movePage(1, 'up');

      const result = surveyCreatorService.getSurveyJson();
      const movedPage = result.pages![0];

      expect(movedPage.name).toBe('page2');
      expect(movedPage.title).toBe('Page 2 with questions');
      expect(movedPage.description).toBe('This page has questions');
      expect(movedPage.elements.length).toBe(1);
      expect(movedPage.elements[0].name).toBe('q1');
    });

    test('should update currentPageIndex when moving the currently selected page', () => {
      // Select page at index 1
      surveyCreatorService.selectPage(1);

      // Move it up (to index 0)
      surveyCreatorService.movePage(1, 'up');

      // Get pages to verify the order changed correctly
      const result = surveyCreatorService.getSurveyJson();
      expect(result.pages![0].name).toBe('page2');
      expect(result.pages![1].name).toBe('page1');
    });
  });
});
