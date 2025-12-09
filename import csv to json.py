import csv
import json
import os
from datetime import datetime

def converter_dataset_csv():
    """
    Converte o ficheiro 'dataset.csv' para JSON e exporta
    """
    
    csv_filename = "DataSet.csv"
    json_filename = "drinks.json"
    
    # Verificar se o ficheiro existe
    if not os.path.exists(csv_filename):
        print(f"ERRO: Ficheiro '{csv_filename}' nao encontrado!")
        print("Ficheiros na pasta atual:")
        for f in os.listdir('.'):
            print(f"  - {f}")
        return False
    
    try:
        print(f"Convertendo '{csv_filename}' para JSON...")
        
        # Ler o CSV
        with open(csv_filename, 'r', encoding='utf-8') as csv_file:
            # Ler dados do CSV
            csv_reader = csv.DictReader(csv_file)
            
            # Converter para lista de dicionários
            dados = []
            for linha in csv_reader:
                # Limpar valores vazios
                linha_limpa = {}
                for chave, valor in linha.items():
                    if valor and str(valor).strip():
                        linha_limpa[chave.strip()] = str(valor).strip()
                
                if linha_limpa:  # So adicionar se nao estiver vazio
                    dados.append(linha_limpa)
        
        # Escrever JSON
        with open(json_filename, 'w', encoding='utf-8') as json_file:
            json.dump(dados, json_file, indent=2, ensure_ascii=False)
        
        # Estatísticas
        print(f"CONVERSAO BEM-SUCEDIDA!")
        print(f"Ficheiro de entrada: {csv_filename}")
        print(f"Ficheiro de saida: {json_filename}")
        print(f"Total de drinks: {len(dados)}")
        print(f"Tamanho do JSON: {os.path.getsize(json_filename):,} bytes")
        
        # Mostrar informações sobre os dados
        if dados:
            print(f"Informacoes dos dados:")
            print(f"   Primeiro drink: {dados[0].get('Drink', 'N/A')}")
            
            # Contar colunas
            colunas = list(dados[0].keys())
            print(f"   Total de colunas: {len(colunas)}")
            print(f"   Exemplo de colunas: {', '.join(colunas[:8])}...")
            
            # Contar ingredientes unicos
            ingredientes_unicos = set()
            for drink in dados:
                for i in range(1, 7):
                    ing = drink.get(f'Ingredient{i}')
                    if ing:
                        ingredientes_unicos.add(ing)
            print(f"   Ingredientes unicos: {len(ingredientes_unicos)}")
        
        return True
        
    except Exception as e:
        print(f"ERRO na conversao: {e}")
        return False

def criar_backup(json_filename):
    """
    Cria uma copia de backup do JSON
    """
    if not os.path.exists(json_filename):
        print(f"Ficheiro '{json_filename}' nao encontrado!")
        return
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_nome = f"drinks_backup_{timestamp}.json"
    
    try:
        with open(json_filename, 'r', encoding='utf-8') as f_origem:
            dados = json.load(f_origem)
        
        with open(backup_nome, 'w', encoding='utf-8') as f_destino:
            json.dump(dados, f_destino, indent=2, ensure_ascii=False)
        
        print(f"Backup criado: {backup_nome}")
        print(f"Localizacao: {os.path.abspath(backup_nome)}")
        
    except Exception as e:
        print(f"Erro ao criar backup: {e}")

def verificar_json(json_filename):
    """
    Verifica se o JSON foi criado corretamente
    """
    if os.path.exists(json_filename):
        with open(json_filename, 'r', encoding='utf-8') as f:
            dados = json.load(f)
        
        print(f"VERIFICACAO DO JSON:")
        print(f"   Ficheiro existe: {json_filename}")
        print(f"   Registros: {len(dados)}")
        print(f"   Tamanho: {os.path.getsize(json_filename):,} bytes")
        print(f"   Caminho completo: {os.path.abspath(json_filename)}")
        
        # Mostrar estrutura do primeiro registro
        if dados:
            primeiro = dados[0]
            print(f"   Exemplo do primeiro drink:")
            print(f"      Nome: {primeiro.get('Drink', 'N/A')}")
            print(f"      Categoria: {primeiro.get('Category', 'N/A')}")
            print(f"      Copo: {primeiro.get('Glass type', 'N/A')}")
            
            # Mostrar ingredientes
            ingredientes = []
            for i in range(1, 4):  # Mostrar so os primeiros 3
                ing = primeiro.get(f'Ingredient{i}')
                if ing:
                    ingredientes.append(ing)
            if ingredientes:
                print(f"      Ingredientes: {', '.join(ingredientes)}...")
    
    else:
        print(f"Ficheiro JSON nao encontrado!")

def main():
    """
    Funcao principal
    """
    print("CONVERSOR: dataset.csv -> drinks.json")
    print("=" * 60)
    
    # Executar conversao
    sucesso = converter_dataset_csv()
    
    if sucesso:
        print("\n" + "=" * 60)
        print("CONVERSAO CONCLUIDA COM SUCESSO!")
        
        # Verificar o resultado
        verificar_json("drinks.json")
        
        # Criar backup automatico
        print(f"Criando backup automatico...")
        criar_backup("drinks.json")
        
        print(f"Processo finalizado!")
        print(f"   O seu ficheiro 'drinks.json' esta pronto para usar.")
        
    else:
        print("\nFalha na conversao!")

# Executar automaticamente
if __name__ == "__main__":
    main()