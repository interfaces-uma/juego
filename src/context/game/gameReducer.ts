import type { DispatchActions, GameState } from "@/types"; //aqui estan todas las funciones que puedes hacer y que le pasas

export function gameReducer(
  state: GameState, //Que quieres hacer
  action: DispatchActions, //Lo que vas a usar/cambiar
): GameState {
  switch (action.type) {
    case "SET_USER": //entra aqui para cambiar el user
      return {
        ...state, //lo que habia antes y lo que pones abajo se cambia o lo que quieras cambiar abajo
        user: action.user, //cambia solo el user al nuevo que te llega(backend) o le pasas(caso de tutorial)
      };
    case "SET_TEAM": {
      const { user, team, role } = action;

      const updatedPlayers = state.players.filter((p) => p.id !== user.id);
      const updatedRedTeam = { ...state.teams.red };
      const updatedBlueTeam = { ...state.teams.blue };

      if (state.teams.red.leader?.id === user.id) {
        updatedRedTeam.leader = null;
      } else {
        updatedRedTeam.agents = state.teams.red.agents.filter(
          (p) => p.id !== user.id,
        );
      }

      if (state.teams.blue.leader?.id === user.id) {
        updatedBlueTeam.leader = null;
      } else {
        updatedBlueTeam.agents = state.teams.blue.agents.filter(
          (p) => p.id !== user.id,
        );
      }

      const updatedUser = { ...user, role, color: team };

      if (team === "red") {
        if (role === "leader") {
          updatedRedTeam.leader = updatedUser;
        } else {
          updatedRedTeam.agents.push(updatedUser);
        }
      } else if (team === "blue") {
        if (role === "leader") {
          updatedBlueTeam.leader = updatedUser;
        } else {
          updatedBlueTeam.agents.push(updatedUser);
        }
      }

      return {
        ...state,
        players: updatedPlayers,
        teams: {
          red: updatedRedTeam,
          blue: updatedBlueTeam,
        },
        user: updatedUser,
      };
    }
    case "SET_STATE":
      return {
        ...action.state,
        user: state.user,
      };

    case "SET_CLUE": {
      const newClue = { word: action.word, cards: action.cards };
      if (state.turn.team === "blue") {
        return {
          ...state,
          clue: newClue,
          teams: {
            ...state.teams,
            blue: {
              ...state.teams.blue,
              clueList: [...state.teams.blue.clueList, newClue],
            },
            red: { ...state.teams.red },
          },
        };
      }
      // Si es turno rojo
      return {
        ...state,
        clue: newClue,
        teams: {
          ...state.teams,
          red: {
            ...state.teams.red,
            clueList: [...state.teams.red.clueList, newClue],
          },
          blue: { ...state.teams.blue },
        },
      };
    }

    case "REVEAL_CARD":
      if (state.turn.team === "blue") {
        return {
          ...state,
          cards: state.cards.map((card) => {
            if (card.word === action.cardText) {
              return { ...card, isFlipped: true };
            }
            return card;
          }),
          clue: state.clue && {
            ...state.clue,
            cards: (state.clue.cards ?? []).map((card) => {
              if (card.word === action.cardText) {
                return { ...card, isFlipped: true };
              }
              return card;
            }),
          },
          teams: {
            ...state.teams,
            blue: {
              ...state.teams.blue,
              clueList: state.teams.blue.clueList
                .filter((clue) => clue?.word)
                .map((clue) =>
                  clue
                    ? {
                        ...clue,
                        word: clue.word || "",
                        cards: (clue.cards ?? []).map((card) => {
                          if (card.word === action.cardText) {
                            return { ...card, isFlipped: true };
                          }
                          return card;
                        }),
                      }
                    : null,
                )
                .filter(Boolean),
            },
          },
        };
      }
      return {
        ...state,
        cards: state.cards.map((card) => {
          if (card.word === action.cardText) {
            return { ...card, isFlipped: true };
          }
          return card;
        }),
        clue: state.clue && {
          ...state.clue,
          cards: (state.clue.cards ?? []).map((card) => {
            if (card.word === action.cardText) {
              return { ...card, isFlipped: true };
            }
            return card;
          }),
        },
        teams: {
          ...state.teams,
          red: {
            ...state.teams.red,
            clueList: state.teams.red.clueList
              .filter((clue) => clue?.word)
              .map((clue) =>
                clue
                  ? {
                      ...clue,
                      word: clue.word || "",
                      cards: (clue.cards ?? []).map((card) => {
                        if (card.word === action.cardText) {
                          return { ...card, isFlipped: true };
                        }
                        return card;
                      }),
                    }
                  : null,
              )
              .filter(Boolean),
          },
        },
      };

    case "SELECT_CARD":
      return {
        ...state,
        cards: state.cards.map((card) => {
          if (card.word === action.cardText) {
            return { ...card, isSelected: !card.isSelected };
          }
          return card;
        }),
      };
    case "NEXT_TURN": {
      const currentRole = state.turn.role;
      const changeColor = currentRole !== "leader";

      if (changeColor) {
        return {
          ...state,
          turn: {
            team: state.turn.team === "red" ? "blue" : "red",
            role: state.turn.role === "leader" ? "agent" : "leader",
          },
        };
      }

      // no hay cambio de color, solo de rol
      return {
        ...state,
        turn: {
          team: state.turn.team,
          role: state.turn.role === "leader" ? "agent" : "leader",
        },
      };
    }

    case "END_GAME":
      return state;

    case "SEND_MESSAGE":
      return {
        ...state,
        messages: [...state.messages, action.message],
      };

    default:
      return state;
  }
}
