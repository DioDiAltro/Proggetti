#include<iostream>
#include"stdarrlib.h"
using namespace std;

#define MAX 1000

void Inserimento(auto V[], int &x);

int main(){
    int Num;
    float V[MAX], dato;

    Inserimento(V, Num);
    
    cout<<"Il numero minore nel vettore e': "<<Funzione.Min(V, Num)<<endl;
    cout<<"Il numero maggiore nel vettore e': "<<Funzione.Max(V, Num)<<endl;
    
    cout<<"Vettore prima del' ordinamente: "<<endl<<"\t";
        for(int i = 0; i < Num; i++){
            cout<<V[i]<<" ";
            
        }

    Funzione.SortC(V, Num);

    cout<<"\nVettore dopo l' ordinamente crescente: "<<endl<<"\t";
        for(int i = 0; i < Num; i++){
            cout<<V[i]<<" ";
            
        }

    Funzione.SortD(V, Num);

    cout<<"\nVettore dopo l' ordinamente decrescente: "<<endl<<"\t";
        for(int i = 0; i < Num; i++){
            cout<<V[i]<<" ";
            
        }

    cout<<"\nInserire il dato da cercare: ";
        cin>>dato;
    int p = Funzione.Find(V, Num, dato);

    if(p != -1){
        cout<<"Il numero: "<<dato<<", e' stato trovato in posizione: "<<p+1<<endl;
    
    }else{
        cout<<"Errore, il numero: "<<dato<<", non e stato trovato"<<endl;;
    }
    return 0;
    
}

void Inserimento(auto V[], int &x){
    cout<<"Inserisci la dimensione del vettore: ";
        cin>>x;

    for(int i = 0; i < x; i++){   
        cout<<"Carica il "<<i+1<<"^ numero: ";
            cin>>V[i];

    }
    
}
