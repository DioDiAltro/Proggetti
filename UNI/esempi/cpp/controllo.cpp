// Istruzioni di controllo: if, switch, for, while, do-while, break, continue.
#include <iostream>
#include <vector>
using namespace std;

int main() {
    // if, else if, else: si esegue il primo ramo con la condizione vera
    int voto = 27;
    if (voto >= 30) cout << "ottimo\n";
    else if (voto >= 24) cout << "buono\n";
    else if (voto >= 18) cout << "sufficiente\n";
    else cout << "insufficiente\n";

    // switch: si salta al case giusto; break esce dallo switch
    int giorno = 6;
    switch (giorno) {
        case 6:
        case 7:
            cout << "fine settimana\n";
            break;
        default:
            cout << "giorno feriale\n";
    }

    // for: inizializzazione; condizione; aggiornamento
    for (int i = 1; i <= 5; i++) cout << i * i << ' ';
    cout << '\n';

    // while: quante volte si può dimezzare 100 prima di arrivare a 1?
    int n = 100, passi = 0;
    while (n > 1) {
        n /= 2;             // 50 25 12 6 3 1
        passi++;
    }
    cout << "dimezzamenti: " << passi << '\n';

    // do-while: il corpo viene eseguito almeno una volta
    int k = 10;
    do {
        cout << "k = " << k << '\n';
        k++;
    } while (k < 5);

    // continue salta al giro successivo, break esce dal ciclo
    for (int i = 0; i < 10; i++) {
        if (i % 2 == 0) continue;   // salta i pari
        if (i > 7) break;           // con i = 9 il ciclo finisce
        cout << i << ' ';
    }
    cout << '\n';

    // for su intervallo (range-based for)
    vector<int> v = {3, 1, 4, 1, 5};
    int somma = 0;
    for (int x : v) somma += x;     // x è una copia di ogni elemento
    for (int& x : v) x *= 10;       // con & si modificano gli elementi veri
    cout << "somma = " << somma << ", v[2] = " << v[2] << '\n';
    return 0;
}
