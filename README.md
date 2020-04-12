# FlashCardsMessengerBot
WIP. A messenger bot for creating flashcards and make you training frequently.

The goal is to create a flash card chatbot. Flashcard are a tool for Leitner System learning process. Each card has both sides, one with a question and the other with the answer of the question. The goal of the user is learning each card and prove they know them by answering right at every question. The user will be asked each card multiple times and as they answer it right, the card will be asked less and less often.

Usually, users must create sets of cards (with about 20 cards a set) and they choose which set they want to practice on at each learning session. This chatbot will behave a bit differently as every card will be in a unique global set.

Frequently, the chatbot will start the conversation and the user will practice. The chatbot has to remember the rate of knowledge for the user for each card to display them at a different rate.


Cards diaplay probability calculation :

All cards start with 100% probability of being displayed (frequency = 1)
For each success on asking the user the questuion, the card probability loses 0.1 point. For each failure, the probability gains 0.1 point.
When the bot has to send cards to the user, it draws n cards (n being previously defined by the user) among all the cards with a weight weighted according to the probability of each card.

Card selection process:
N cards are considered, each having a probability p of being selected.
A table of cumulative probabilities is created.
We run a random between 0 and the max cumulative probability. The random number corresponds to the chosen card.
Repeat the operation. If we fall on the same card again, we restart the operation.

Ex : 
Card1 --> p = 0.2
Card2 --> p = 0.3
Card3 --> p = 1

Premier tableau :
[[Card1,Card2,Card3],[0.2,0.3,1]]
Card1	0.2
Card2	0.3
Card3	1

Second tableau :
[[Card1,Card2,Card3],[0.2,0.5,1.5]]
Card1	0.2
Card2	0.5
Card3	1.5

On lance un random x entre 0 et 1.5 :
0.0 < x < 0.2 --> Card1
0.2 < x < 0.5 --> Card2
0.5 < x < 1.5 --> Card3

Translated with www.DeepL.com/Translator (free version)